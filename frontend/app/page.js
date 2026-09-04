"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5100")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

const emptyForm = { title: "", description: "", dueDate: "", priority: "medium" };

export default function Home() {
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("task_token");
    const savedUser = localStorage.getItem("task_user");
    // Session state is restored only after the browser has mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedToken && savedUser) { setToken(savedToken); setUser(JSON.parse(savedUser)); }
  }, []);

  useEffect(() => {
    if (!token) return;
    request("/api/tasks", { headers: { Authorization: `Bearer ${token}` } })
      .then((data) => setTasks(data.tasks))
      .catch((err) => { setError(err.message); logout(); });
  }, [token]);

  const completed = useMemo(() => tasks.filter((task) => task.completed).length, [tasks]);
  const initials = user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  function clearNotices() { setError(""); setMessage(""); }
  function logout() { localStorage.removeItem("task_token"); localStorage.removeItem("task_user"); setToken(""); setUser(null); setTasks([]); }

  async function handleAuth(event) {
    event.preventDefault(); clearNotices(); setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const data = await request(endpoint, { method: "POST", body: JSON.stringify(authForm) });
      if (mode === "register") { setMessage("Account created. You can log in now."); setMode("login"); }
      else { localStorage.setItem("task_token", data.token); localStorage.setItem("task_user", JSON.stringify(data.user)); setToken(data.token); setUser(data.user); }
      setAuthForm({ name: "", email: "", password: "" });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  async function addTask(event) {
    event.preventDefault(); clearNotices(); setLoading(true);
    try {
      const data = await request("/api/tasks", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      setTasks((current) => [data.task, ...current]); setForm(emptyForm); setShowForm(false); setMessage("Task added to your plan.");
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  async function toggleTask(task) {
    try {
      const data = await request(`/api/tasks/${task.id}`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ completed: !task.completed }) });
      setTasks((current) => current.map((item) => item.id === task.id ? data.task : item));
    } catch (err) { setError(err.message); }
  }

  async function removeTask(id) {
    if (!window.confirm("Delete this task permanently?")) return;
    try { await request(`/api/tasks/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); setTasks((current) => current.filter((task) => task.id !== id)); setMessage("Task deleted."); }
    catch (err) { setError(err.message); }
  }

  if (!user) return <AuthView mode={mode} setMode={setMode} form={authForm} setForm={setAuthForm} onSubmit={handleAuth} loading={loading} error={error} message={message} />;

  return (
    <main className="app-shell">
      <nav className="topbar"><div className="brand"><span className="brand-mark">S</span><span>Student Task Manager</span></div><div className="profile"><span className="avatar">{initials}</span><span className="profile-name">{user.name}</span><button className="text-button" onClick={logout}>Log out</button></div></nav>
      <section className="dashboard-wrap">
        <div className="dashboard-heading"><div><p className="eyebrow">Your workspace</p><h1>Good to see you, {user.name.split(" ")[0]}.</h1><p className="subtle">Make space for what matters today.</p></div><button className="primary-button" onClick={() => { setShowForm(true); clearNotices(); }}><span>+</span> Add task</button></div>
        {(error || message) && <div className={`notice ${error ? "notice-error" : "notice-success"}`}>{error || message}</div>}
        <div className="stats-grid"><Stat label="Total tasks" value={tasks.length} icon="◷" tone="blue" /><Stat label="Completed" value={completed} icon="✓" tone="green" /><Stat label="In progress" value={tasks.length - completed} icon="↗" tone="orange" /></div>
        {showForm && <form className="task-form" onSubmit={addTask}><div className="form-title"><div><p className="eyebrow">New task</p><h2>What needs your attention?</h2></div><button type="button" className="close-button" onClick={() => setShowForm(false)} aria-label="Close">×</button></div><div className="form-fields"><label>Task title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Finish biology notes" /></label><label>Description<span className="optional">Optional</span><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Add a little context..." rows="3" /></label><div className="form-row"><label>Due date<input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label><label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label></div></div><button className="primary-button form-submit" disabled={loading}>{loading ? "Adding..." : "Add task"}</button></form>}
        <div className="task-section"><div className="section-heading"><div><p className="eyebrow">Your list</p><h2>Tasks</h2></div><span className="task-count">{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</span></div>{tasks.length === 0 ? <div className="empty-state"><div className="empty-icon">✦</div><h3>Your list is clear</h3><p>Add your first task and keep your momentum going.</p><button className="secondary-button" onClick={() => setShowForm(true)}>Create a task</button></div> : <div className="tasks-list">{tasks.map((task) => <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={removeTask} />)}</div>}</div>
      </section><footer>Built as a full-stack development learning project <span>•</span> Student Task Manager</footer>
    </main>
  );
}

function AuthView({ mode, setMode, form, setForm, onSubmit, loading, error, message }) { return <main className="auth-shell"><div className="auth-aside"><div className="brand"><span className="brand-mark">S</span><span>Student Task Manager</span></div><div className="aside-copy"><p className="eyebrow">A calmer way to study</p><h1>Turn scattered plans into steady progress.</h1><p>One focused place for the assignments, ideas, and small wins that make up your semester.</p></div><div className="aside-note"><span>“</span><p>The best time to start was yesterday. The next best time is now.</p></div></div><div className="auth-panel"><div className="mobile-brand brand"><span className="brand-mark">S</span><span>Student Task Manager</span></div><div className="auth-card"><p className="eyebrow">{mode === "login" ? "Welcome back" : "Start fresh"}</p><h2>{mode === "login" ? "Pick up where you left off." : "Build your study rhythm."}</h2><p className="subtle">{mode === "login" ? "Log in to see your tasks." : "Create an account in a few seconds."}</p>{(error || message) && <div className={`notice ${error ? "notice-error" : "notice-success"}`}>{error || message}</div>}<form onSubmit={onSubmit}>{mode === "register" && <label>Full name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label>}<label>Email address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label><label>Password<input required type="password" minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" /></label><button className="primary-button full-button" disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}</button></form><p className="switch-copy">{mode === "login" ? "New here?" : "Already have an account?"} <button className="link-button" onClick={() => { setMode(mode === "login" ? "register" : "login"); }}>{mode === "login" ? "Create an account" : "Log in"}</button></p></div><p className="auth-footer">Simple tools for a more intentional semester.</p></div></main> }

function Stat({ label, value, icon, tone }) { return <div className="stat-card"><span className={`stat-icon ${tone}`}>{icon}</span><div><strong>{value}</strong><span>{label}</span></div></div> }
function TaskCard({ task, onToggle, onDelete }) { const due = task.due_date ? new Date(`${task.due_date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No due date"; return <article className={`task-card ${task.completed ? "is-complete" : ""}`}><button className="check-button" onClick={() => onToggle(task)} aria-label={task.completed ? "Mark pending" : "Mark complete"}>{task.completed ? "✓" : ""}</button><div className="task-content"><div className="task-top"><h3>{task.title}</h3><span className={`priority ${task.priority}`}>{task.priority}</span></div>{task.description && <p>{task.description}</p>}<div className="task-meta"><span>◷ {due}</span><span>Added {new Date(task.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span><span className={`status ${task.completed ? "done" : "pending"}`}>{task.completed ? "Completed" : "Pending"}</span></div></div><button className="delete-button" onClick={() => onDelete(task.id)} aria-label="Delete task">⌫</button></article> }

