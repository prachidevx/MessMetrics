import express from "express";
import prisma from "../db/prisma.js";

const router = express.Router();

// GET all meals
router.get("/meals", async (req, res) => {
  try {
    const meals = await prisma.meal.findMany();

    res.status(200).json(meals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new meal log
router.post("/meal-logs", async (req, res) => {
  try {
    const {
      date,
      mealId,
      attendance,
      preparedKg,
      wastedKg
    } = req.body;

    const mealLog = await prisma.mealLog.create({
      data: {
        date: new Date(date),
        mealId,
        attendance: Number(attendance),
        preparedKg: String(preparedKg),
        wastedKg: String(wastedKg)
      }
    });

    res.status(201).json(mealLog);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
