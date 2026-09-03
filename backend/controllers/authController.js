import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

function tokenFor(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: "Name, email, and password are required." });
  if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email", [name.trim(), normalizedEmail, hash]);
    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") return res.status(400).json({ message: "An account with that email already exists." });
    console.error(error);
    res.status(500).json({ message: "Unable to create your account right now." });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email?.trim() || !password) return res.status(400).json({ message: "Email and password are required." });

  try {
    const result = await pool.query("SELECT id, name, email, password FROM users WHERE email = $1", [email.trim().toLowerCase()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Email or password is incorrect." });
    res.json({ token: tokenFor(user.id), user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to log in right now." });
  }
}
