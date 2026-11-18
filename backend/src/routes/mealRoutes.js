import express from "express";
import prisma from "../db/prisma.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

const VALID_MEAL_TYPES = ["Breakfast", "Lunch", "Snacks", "Dinner"];

function normalizeMealType(type) {
  if (!type) return null;
  return (
    VALID_MEAL_TYPES.find(
      (t) => t.toLowerCase() === String(type).trim().toLowerCase()
    ) || null
  );
}

router.get("/meals", async (req, res) => {
  try {
    const { mealType, date, startDate, endDate, limit } = req.query;
    const where = {};

    if (mealType) {
      const validated = normalizeMealType(mealType);
      where.mealType = validated || String(mealType).trim();
    }

    if (date) {
      const start = new Date(date);
      if (Number.isNaN(start.getTime())) {
        return res.status(400).json({ error: "Invalid date format." });
      }
      const end = new Date(date);
      end.setUTCDate(end.getUTCDate() + 1);
      where.date = { gte: start, lt: end };
    } else if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setUTCDate(end.getUTCDate() + 1);
        dateFilter.lt = end;
      }
      where.date = dateFilter;
    }

    const meals = await prisma.meal.findMany({
      where,
      include: {
        MealDish: {
          include: { Dish: true },
        },
      },
      orderBy: { date: "desc" },
      take: limit ? Number(limit) : undefined,
    });

    return res.status(200).json(meals);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


router.get("/meals/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid meal ID." });
    }

    const meal = await prisma.meal.findUnique({
      where: { id },
      include: {
        MealDish: {
          include: { Dish: true },
        },
      },
    });

    if (!meal) {
      return res.status(404).json({ error: "Meal not found." });
    }

    return res.status(200).json(meal);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/meals", requireAuth, async (req, res) => {
  try {
    const { date, mealType, attendance } = req.body;

    if (!mealType) {
      return res.status(400).json({ error: "mealType is required." });
    }

    const validatedMealType = normalizeMealType(mealType);
    if (!validatedMealType) {
      return res.status(400).json({
        error: `Invalid mealType "${mealType}". Allowed values are: ${VALID_MEAL_TYPES.join(", ")}.`,
      });
    }

    const attendanceNum = attendance !== undefined ? Number(attendance) : 0;
    if (attendanceNum < 0) {
      return res.status(400).json({ error: "Attendance cannot be negative." });
    }

    const meal = await prisma.meal.create({
      data: {
        date: date ? new Date(date) : undefined,
        mealType: validatedMealType,
        attendance: attendanceNum,
      },
    });

    return res.status(201).json(meal);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: `A ${req.body.mealType} session already exists for this date.`,
      });
    }
    return res.status(500).json({ error: error.message });
  }
});


router.put("/meals/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid meal ID." });
    }

    const { date, mealType, attendance } = req.body;
    const data = {};

    if (date !== undefined) data.date = new Date(date);
    if (mealType !== undefined) {
      const validated = normalizeMealType(mealType);
      if (!validated) {
        return res.status(400).json({
          error: `Invalid mealType "${mealType}". Allowed values are: ${VALID_MEAL_TYPES.join(", ")}.`,
        });
      }
      data.mealType = validated;
    }
    if (attendance !== undefined) {
      const attNum = Number(attendance);
      if (attNum < 0) {
        return res.status(400).json({ error: "Attendance cannot be negative." });
      }
      data.attendance = attNum;
    }

    const updatedMeal = await prisma.meal.update({
      where: { id },
      data,
    });

    return res.status(200).json(updatedMeal);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Meal not found." });
    }
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "A meal session with this mealType already exists for this date.",
      });
    }
    return res.status(500).json({ error: error.message });
  }
});

router.delete("/meals/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid meal ID." });
    }

    await prisma.meal.delete({ where: { id } });
    return res.status(200).json({ message: "Meal deleted successfully." });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Meal not found." });
    }
    return res.status(500).json({ error: error.message });
  }
});


router.get("/meal-dishes", async (req, res) => {
  try {
    const { mealId, dishId } = req.query;
    const where = {};

    if (mealId) where.mealId = Number(mealId);
    if (dishId) where.dishId = Number(dishId);

    const mealDishes = await prisma.mealDish.findMany({
      where,
      include: {
        Dish: true,
        Meal: true,
      },
      orderBy: { id: "desc" },
    });

    return res.status(200).json(mealDishes);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


router.get("/meal-dishes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid meal-dish ID." });
    }

    const mealDish = await prisma.mealDish.findUnique({
      where: { id },
      include: {
        Dish: true,
        Meal: true,
      },
    });

    if (!mealDish) {
      return res.status(404).json({ error: "MealDish record not found." });
    }

    return res.status(200).json(mealDish);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/meal-dishes", requireAuth, async (req, res) => {
  try {
    const { mealId, dishId, quantityPrepared, quantityWasted } = req.body;

    if (
      mealId === undefined ||
      dishId === undefined ||
      quantityPrepared === undefined ||
      quantityWasted === undefined
    ) {
      return res.status(400).json({
        error:
          "mealId, dishId, quantityPrepared, and quantityWasted are required.",
      });
    }

    const prep = Number(quantityPrepared);
    const waste = Number(quantityWasted);

    if (prep < 0) {
      return res
        .status(400)
        .json({ error: "quantityPrepared cannot be negative." });
    }
    if (waste < 0) {
      return res
        .status(400)
        .json({ error: "quantityWasted cannot be negative." });
    }
    if (waste > prep) {
      return res.status(400).json({
        error: `quantityWasted (${waste} kg) cannot exceed quantityPrepared (${prep} kg).`,
      });
    }

    const mealDish = await prisma.mealDish.create({
      data: {
        mealId: Number(mealId),
        dishId: Number(dishId),
        quantityPrepared: prep,
        quantityWasted: waste,
      },
      include: {
        Dish: true,
        Meal: true,
      },
    });

    return res.status(201).json(mealDish);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ error: "This dish is already logged for this meal." });
    }
    if (error.code === "P2003") {
      return res
        .status(400)
        .json({ error: "Invalid mealId or dishId provided." });
    }
    return res.status(500).json({ error: error.message });
  }
});

router.put("/meal-dishes/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid meal-dish ID." });
    }

    const existing = await prisma.mealDish.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "MealDish record not found." });
    }

    const { quantityPrepared, quantityWasted } = req.body;
    const data = {};

    const prep =
      quantityPrepared !== undefined
        ? Number(quantityPrepared)
        : existing.quantityPrepared;
    const waste =
      quantityWasted !== undefined
        ? Number(quantityWasted)
        : existing.quantityWasted;

    if (prep < 0) {
      return res
        .status(400)
        .json({ error: "quantityPrepared cannot be negative." });
    }
    if (waste < 0) {
      return res
        .status(400)
        .json({ error: "quantityWasted cannot be negative." });
    }
    if (waste > prep) {
      return res.status(400).json({
        error: `quantityWasted (${waste} kg) cannot exceed quantityPrepared (${prep} kg).`,
      });
    }

    if (quantityPrepared !== undefined) data.quantityPrepared = prep;
    if (quantityWasted !== undefined) data.quantityWasted = waste;

    const updatedMealDish = await prisma.mealDish.update({
      where: { id },
      data,
      include: {
        Dish: true,
        Meal: true,
      },
    });

    return res.status(200).json(updatedMealDish);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "MealDish record not found." });
    }
    return res.status(500).json({ error: error.message });
  }
});


router.delete("/meal-dishes/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid meal-dish ID." });
    }

    await prisma.mealDish.delete({ where: { id } });
    return res
      .status(200)
      .json({ message: "MealDish record deleted successfully." });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "MealDish record not found." });
    }
    return res.status(500).json({ error: error.message });
  }
});

export default router;
