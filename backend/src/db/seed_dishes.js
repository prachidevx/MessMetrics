import "dotenv/config";
import prisma from "./prisma.js";
import { DEFAULT_WEEKLY_MENU } from "../routes/weeklyMenuRoutes.js";

async function main() {
  console.log("Seeding master dishes into Dish table...");

  const allDishes = new Map();
  for (const [day, dayMenu] of Object.entries(DEFAULT_WEEKLY_MENU)) {
    for (const [mealType, items] of Object.entries(dayMenu)) {
      for (const item of items) {
        if (!allDishes.has(item)) {
          allDishes.set(item, mealType);
        }
      }
    }
  }

  let count = 0;
  for (const [name, category] of allDishes.entries()) {
    const existing = await prisma.dish.findUnique({ where: { name } });
    if (!existing) {
      await prisma.dish.create({
        data: { name, category },
      });
      count++;
    }
  }

  const total = await prisma.dish.count();
  console.log(`Seeding complete. Inserted ${count} new dishes. Total dishes in DB: ${total}.`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
