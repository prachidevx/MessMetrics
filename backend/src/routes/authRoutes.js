import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { requireAuth, JWT_SECRET } from "../middleware/authMiddleware.js";

const router = express.Router();


const users = [
  {
    id: 1,
    name: "Mess Admin",
    email: (process.env.ADMIN_EMAIL || "admin@messmetrics.com").toLowerCase(),
    password: bcrypt.hashSync(process.env.ADMIN_PASSWORD || "admin123", 10),
    role: "ADMIN",
  },
];

let nextUserId = 2;

function createToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}


router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = users.find((u) => u.email === normalizedEmail);

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: nextUserId++,
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role ? String(role).toUpperCase() : "STAFF",
    };

    users.push(newUser);
    const token = createToken(newUser);

    return res.status(201).json({
      message: "User registered successfully.",
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = users.find((u) => u.email === normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


router.get("/me", requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(200).json({ user: req.user });
  }

  return res.status(200).json({ user: sanitizeUser(user) });
});


router.post("/logout", (req, res) => {
  return res.status(200).json({ message: "Logged out successfully." });
});

export default router;
