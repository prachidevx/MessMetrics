import prisma from "./prisma.js";
import { DEFAULT_WEEKLY_MENU } from "../routes/weeklyMenuRoutes.js";

async function main() {
  console.log("Seeding database with 4 meals (Breakfast, Lunch, Snacks, Dinner) for 90 days...");

  // Clear existing
  await prisma.mealDish.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.meal.deleteMany();

  // 1. Gather all unique dishes from the weekly menu
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

  const createdDishes = {};
  for (const [name, category] of allDishes.entries()) {
    const dish = await prisma.dish.create({
      data: { name, category },
    });
    createdDishes[name] = dish;
  }
  console.log(`Created ${Object.keys(createdDishes).length} unique dishes.`);

  // 2. Generate 90 days of meal logs across all 4 meal slots
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const mealTypes = ["Breakfast", "Lunch", "Snacks", "Dinner"];

  const now = new Date();
  let totalMealsCount = 0;

  for (let offset = 89; offset >= 0; offset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - offset);
    date.setHours(12, 0, 0, 0);

    const dayName = daysOfWeek[date.getDay()];
    const dayMenu = DEFAULT_WEEKLY_MENU[dayName] || DEFAULT_WEEKLY_MENU.Monday;

    for (let m = 0; m < 4; m++) {
      const mealType = mealTypes[m];
      const dishNames = dayMenu[mealType] || [];

      // Base attendance variation:
      // Breakfast: 280-340, Lunch: 380-435, Snacks: 250-320, Dinner: 340-410
      const isWeekend = dayName === "Saturday" || dayName === "Sunday";
      let baseAtt = m === 0 ? 310 : m === 1 ? 405 : m === 2 ? 285 : 375;
      if (isWeekend) baseAtt -= 25;
      const jitter = Math.floor(Math.sin(offset + m) * 18);
      const attendance = Math.max(200, Math.min(445, baseAtt + jitter));

      // Base waste variation (kg)
      let baseWaste = m === 0 ? 5 : m === 1 ? 11 : m === 2 ? 3.5 : 8;
      const wasteJitter = Number((Math.cos(offset * 2 + m) * 1.5).toFixed(1));
      const totalWaste = Math.max(1.5, Number((baseWaste + wasteJitter).toFixed(1)));

      const meal = await prisma.meal.create({
        data: {
          date,
          mealType,
          attendance,
        },
      });
      totalMealsCount++;

      if (dishNames.length > 0) {
        const wastePerDish = Number((totalWaste / dishNames.length).toFixed(1));
        const prepPerDish = Number(((attendance * 0.32 + totalWaste) / dishNames.length).toFixed(1));

        for (const dName of dishNames) {
          const dishObj = createdDishes[dName];
          if (dishObj) {
            await prisma.mealDish.create({
              data: {
                mealId: meal.id,
                dishId: dishObj.id,
                quantityPrepared: prepPerDish,
                quantityWasted: wastePerDish,
              },
            });
          }
        }
      }
    }
  }

  console.log(`Seeding complete: logged ${totalMealsCount} meals (4 meals/day for 90 days) with full weekly dish relations.`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
