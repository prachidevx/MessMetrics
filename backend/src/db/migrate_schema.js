import "dotenv/config";
import pg from "pg";

const { Client } = pg;

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  console.log("Connected to PostgreSQL");

  // 1. Add waste column to Meal table with check constraint
  await client.query(`
    ALTER TABLE "Meal" ADD COLUMN IF NOT EXISTS "waste" DOUBLE PRECISION NOT NULL DEFAULT 0;
  `);
  console.log("Added waste column to Meal");

  await client.query(`
    ALTER TABLE "Meal" DROP CONSTRAINT IF EXISTS "chk_waste_non_negative";
    ALTER TABLE "Meal" ADD CONSTRAINT "chk_waste_non_negative" CHECK ("waste" >= 0);
  `);
  console.log("Added chk_waste_non_negative constraint to Meal");

  // 2. Drop quantity constraints from MealDish table
  await client.query(`
    ALTER TABLE "MealDish" DROP CONSTRAINT IF EXISTS "chk_quantity_prepared_non_negative";
    ALTER TABLE "MealDish" DROP CONSTRAINT IF EXISTS "chk_quantity_wasted_non_negative";
    ALTER TABLE "MealDish" DROP CONSTRAINT IF EXISTS "chk_wasted_lte_prepared";
  `);
  console.log("Dropped quantity constraints from MealDish");

  // 3. Drop quantity columns from MealDish table
  await client.query(`
    ALTER TABLE "MealDish" DROP COLUMN IF EXISTS "quantityPrepared";
    ALTER TABLE "MealDish" DROP COLUMN IF EXISTS "quantityWasted";
  `);
  console.log("Dropped quantityPrepared and quantityWasted from MealDish");

  // 4. Ensure index on dishId
  await client.query(`
    CREATE INDEX IF NOT EXISTS "MealDish_dishId_idx" ON "MealDish"("dishId");
  `);
  console.log("Verified MealDish_dishId_idx");

  await client.end();
  console.log("Migration complete!");
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
