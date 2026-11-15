import express from 'express';
import cors from 'cors';
import prisma from "./db/prisma.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('working, yay!!');
});

async function startServer() {
  try {

    await prisma.$connect();
    console.log("prisma connected to neon successfully");

    app.listen(3000, () => {
      console.log("MessMetrics backend is running on http://localhost:3000");
    });

  } catch (error) {
    console.error("Database connection failed. Server shutting down:", error);
    process.exit(1);
  }
}

startServer();