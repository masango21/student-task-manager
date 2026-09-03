import { pool } from "../db.js";

const taskFields = "id, title, description, due_date, priority, completed, created_at";

export async function getTasks(req, res) {
  try {
    const result = await pool.query(`SELECT ${taskFields} FROM tasks WHERE user_id = $1 ORDER BY completed ASC, due_date ASC NULLS LAST, created_at DESC`, [req.userId]);
    res.json({ tasks: result.rows });
  } catch (error) { console.error(error); res.status(500).json({ message: "Unable to load tasks." }); }
}

export async function createTask(req, res) {
  const { title, description = "", dueDate, priority = "medium" } = req.body;
  if (!title?.trim()) return res.status(400).json({ message: "A task title is required." });
  if (!["low", "medium", "high"].includes(priority)) return res.status(400).json({ message: "Choose a valid priority." });
  try {
    const result = await pool.query(`INSERT INTO tasks (user_id, title, description, due_date, priority) VALUES ($1, $2, $3, $4, $5) RETURNING ${taskFields}`, [req.userId, title.trim(), description.trim(), dueDate || null, priority]);
    res.status(201).json({ task: result.rows[0] });
  } catch (error) { console.error(error); res.status(500).json({ message: "Unable to create task." }); }
}

export async function updateTask(req, res) {
  const { title, description = "", dueDate, priority, completed } = req.body;
  try {
    const result = await pool.query(`UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), due_date = $3, priority = COALESCE($4, priority), completed = COALESCE($5, completed) WHERE id = $6 AND user_id = $7 RETURNING ${taskFields}`, [title?.trim() || null, description, dueDate || null, priority, completed, req.params.id, req.userId]);
    if (!result.rowCount) return res.status(404).json({ message: "Task not found." });
    res.json({ task: result.rows[0] });
  } catch (error) { console.error(error); res.status(500).json({ message: "Unable to update task." }); }
}

export async function deleteTask(req, res) {
  try {
    const result = await pool.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2", [req.params.id, req.userId]);
    if (!result.rowCount) return res.status(404).json({ message: "Task not found." });
    res.json({ message: "Task deleted." });
  } catch (error) { console.error(error); res.status(500).json({ message: "Unable to delete task." }); }
}
