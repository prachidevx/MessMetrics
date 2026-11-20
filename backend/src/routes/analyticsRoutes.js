import express from "express";
import prisma from "../db/prisma.js";

const router = express.Router();

function buildDateFilter(startDate, endDate) {
  if (!startDate && !endDate) return {};

  const dateFilter = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setUTCDate(end.getUTCDate() + 1);
    dateFilter.lt = end;
  }
  return { date: dateFilter };
}

function summarizeMealDishes(mealDishes) {
  let totalPrepared = 0;
  let totalWasted = 0;

  for (const item of mealDishes) {
    totalPrepared += item.quantityPrepared;
    totalWasted += item.quantityWasted;
  }

  const totalConsumed = totalPrepared - totalWasted;
  const wastePercentage =
    totalPrepared > 0
      ? Number(((totalWasted / totalPrepared) * 100).toFixed(2))
      : 0;

  return {
    totalPrepared: Number(totalPrepared.toFixed(2)),
    totalWasted: Number(totalWasted.toFixed(2)),
    totalConsumed: Number(totalConsumed.toFixed(2)),
    wastePercentage,
  };
}

function summarizeMeals(meals) {
  let totalAttendance = 0;
  const allMealDishes = [];

  for (const meal of meals) {
    totalAttendance += meal.attendance;
    allMealDishes.push(...meal.MealDish);
  }

  return {
    totalMeals: meals.length,
    totalAttendance,
    ...summarizeMealDishes(allMealDishes),
  };
}

// GET /api/analytics/summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get("/summary", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const meals = await prisma.meal.findMany({
      where: buildDateFilter(startDate, endDate),
      include: { MealDish: true },
    });

    return res.status(200).json(summarizeMeals(meals));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/by-meal-type
router.get("/by-meal-type", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const meals = await prisma.meal.findMany({
      where: buildDateFilter(startDate, endDate),
      include: { MealDish: true },
    });

    const grouped = {};

    for (const meal of meals) {
      if (!grouped[meal.mealType]) {
        grouped[meal.mealType] = [];
      }
      grouped[meal.mealType].push(meal);
    }

    const result = Object.entries(grouped).map(([mealType, groupMeals]) => ({
      mealType,
      ...summarizeMeals(groupMeals),
    }));

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/daily
router.get("/daily", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const meals = await prisma.meal.findMany({
      where: buildDateFilter(startDate, endDate),
      include: { MealDish: true },
      orderBy: { date: "asc" },
    });

    const groupedByDate = {};

    for (const meal of meals) {
      const day = meal.date.toISOString().split("T")[0];
      if (!groupedByDate[day]) {
        groupedByDate[day] = [];
      }
      groupedByDate[day].push(meal);
    }

    const dailyStats = Object.entries(groupedByDate).map(([date, dayMeals]) => ({
      date,
      ...summarizeMeals(dayMeals),
    }));

    return res.status(200).json(dailyStats);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
