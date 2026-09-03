import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { initializeDatabase } from "./db.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5100;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3100" }));
app.use(express.json());
app.get("/", (_req, res) => res.json({ message: "Student Task Manager API is running" }));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use((_req, res) => res.status(404).json({ message: "Route not found." }));

initializeDatabase()
  .then(() => app.listen(port, () => console.log(`API running on port ${port}`)))
  .catch((error) => { console.error("Database initialization failed:", error.message); process.exit(1); });
