import express from "express";
import prisma from "../db/prisma.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all dishes (supports optional ?category= filter)
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const where = category ? { category: String(category).trim() } : {};

    const dishes = await prisma.dish.findMany({
      where,
      orderBy: { id: "asc" },
    });

    return res.status(200).json(dishes);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET single dish by ID
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid dish ID." });
    }

    const dish = await prisma.dish.findUnique({
      where: { id },
      include: {
        MealDish: {
          include: { Meal: true },
        },
      },
    });

    if (!dish) {
      return res.status(404).json({ error: "Dish not found." });
    }

    return res.status(200).json(dish);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST create a new dish
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || !category) {
      return res
        .status(400)
        .json({ error: "Dish name and category are required." });
    }

    const dish = await prisma.dish.create({
      data: {
        name: String(name).trim(),
        category: String(category).trim(),
      },
    });

    return res.status(201).json(dish);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "This dish already exists." });
    }
    return res.status(500).json({ error: error.message });
  }
});

// PUT update a dish
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid dish ID." });
    }

    const { name, category } = req.body;
    const data = {};

    if (name !== undefined) data.name = String(name).trim();
    if (category !== undefined) data.category = String(category).trim();

    const updatedDish = await prisma.dish.update({
      where: { id },
      data,
    });

    return res.status(200).json(updatedDish);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Dish not found." });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Dish name already exists." });
    }
    return res.status(500).json({ error: error.message });
  }
});

// DELETE a dish
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid dish ID." });
    }

    await prisma.dish.delete({ where: { id } });
    return res.status(200).json({ message: "Dish deleted successfully." });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Dish not found." });
    }
    return res.status(500).json({ error: error.message });
  }
});

export default router;

