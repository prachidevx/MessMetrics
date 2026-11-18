import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../db/prisma.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.resolve(__dirname, "../../data/weekly-menu.json");

export const DEFAULT_WEEKLY_MENU = {
  Monday: {
    Breakfast: ["Idli Sambhar", "Coconut Chutney", "Filter Coffee"],
    Lunch: ["Rajma Masala", "Steamed Rice", "Tawa Roti", "Cucumber Salad"],
    Snacks: ["Crispy Samosa", "Green Mint Chutney", "Masala Chai"],
    Dinner: ["Aloo Gobi", "Dal Tadka", "Phulka Roti", "Gulab Jamun"],
  },
  Tuesday: {
    Breakfast: ["Poha", "Bread & Butter", "Masala Chai"],
    Lunch: ["Shahi Paneer", "Jeera Rice", "Tandoori Roti", "Boondi Raita"],
    Snacks: ["Veg Cutlet", "Tomato Sauce", "Hot Ginger Tea"],
    Dinner: ["Mixed Vegetable", "Dal Makhani", "Butter Naan", "Rice Kheer"],
  },
  Wednesday: {
    Breakfast: ["Masala Dosa", "Sambhar", "Green Chutney", "Tea"],
    Lunch: ["Chole Bhature", "Plain Rice", "Onion Salad", "Pickle"],
    Snacks: ["Bread Pakoda", "Sweet Imli Chutney", "Cardamom Tea"],
    Dinner: ["Palak Paneer", "Yellow Dal", "Chapati", "Fruit Custard"],
  },
  Thursday: {
    Breakfast: ["Aloo Paratha", "Curd", "Pickle", "Masala Chai"],
    Lunch: ["Kadhi Pakoda", "Steamed Rice", "Aloo Bhindi", "Roti"],
    Snacks: ["Sev Bhel Puri", "Crispy Papdi", "Masala Chai"],
    Dinner: ["Veg Biryani", "Mirchi Ka Salan", "Raita", "Moong Dal Halwa"],
  },
  Friday: {
    Breakfast: ["Veg Upma", "Coconut Chutney", "Filter Coffee"],
    Lunch: ["Paneer Butter Masala", "Dal Fry", "Tawa Roti", "Veg Pulao"],
    Snacks: ["Crispy Onion Pakoda", "Mint Dip", "Filter Coffee"],
    Dinner: ["Dal Palak", "Jeera Rice", "Butter Roti", "Sewaiyan Kheer"],
  },
  Saturday: {
    Breakfast: ["Puri Bhaji", "Suji Halwa", "Masala Chai"],
    Lunch: ["Veg Pulao", "Curd Rice", "Papad", "Mixed Veg Curry"],
    Snacks: ["Grilled Veg Sandwich", "Potato Chips", "Chai"],
    Dinner: ["Paneer Do Pyaza", "Dal Tadka", "Missi Roti", "Ice Cream"],
  },
  Sunday: {
    Breakfast: ["Chole Kulche", "Sweet Lassi", "Fresh Fruit Bowl"],
    Lunch: ["Paneer Lababdar", "Dal Makhani", "Veg Pulao", "Butter Naan"],
    Snacks: ["White Sauce Veg Pasta", "Garlic Bread", "Cold Coffee / Tea"],
    Dinner: ["Pav Bhaji", "Tawa Pulao", "Green Salad", "Fruit Custard"],
  },
};

function readWeeklyMenu() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed.Monday && parsed.Monday.Snacks) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read weekly menu file, using default:", e.message);
  }
  return DEFAULT_WEEKLY_MENU;
}

function saveWeeklyMenu(data) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save weekly menu file:", e.message);
  }
}

saveWeeklyMenu(DEFAULT_WEEKLY_MENU);

router.get("/", (req, res) => {
  const menu = readWeeklyMenu();
  return res.status(200).json(menu);
});

router.get("/today", (req, res) => {
  const menu = readWeeklyMenu();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = days[new Date().getDay()];
  const todayMenu = menu[todayName] || menu.Monday;
  return res.status(200).json({ day: todayName, menu: todayMenu });
});

router.put("/", async (req, res) => {
  try {
    const current = readWeeklyMenu();
    const { day, menu, fullMenu } = req.body;

    if (fullMenu) {
      saveWeeklyMenu(fullMenu);
      return res.status(200).json({ message: "Full weekly menu updated successfully.", menu: fullMenu });
    }

    if (day && menu) {
      current[day] = menu;
      saveWeeklyMenu(current);

      try {
        for (const [category, items] of Object.entries(menu)) {
          if (Array.isArray(items)) {
            for (const name of items) {
              const trimmed = String(name).trim();
              if (trimmed) {
                await prisma.dish.upsert({
                  where: { name: trimmed },
                  update: {},
                  create: { name: trimmed, category },
                }).catch(() => { });
              }
            }
          }
        }
      } catch (e) {
        console.warn("Notice updating dishes:", e.message);
      }

      return res.status(200).json({ message: `Menu for ${day} updated successfully.`, menu: current });
    }

    return res.status(400).json({ error: "Invalid request payload. Specify 'day' and 'menu' or 'fullMenu'." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
