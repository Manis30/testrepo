import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

async function request(path, options = {}) {
  if (!API_URL) {
    throw new Error("VITE_API_URL is not configured. Set it in frontend/.env.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || `Request failed (${response.status})`);
  }

  return response.status === 204 ? null : response.json();
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setTasks(await request("/tasks"));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const remaining = useMemo(() => tasks.filter((task) => !task.completed).length, [tasks]);
  const visibleTasks = useMemo(
    () => tasks.filter((task) => {
      if (filter === "active") return !task.completed;
      if (filter === "completed") return task.completed;
      return true;
    }),
    [filter, tasks]
  );

  function resetForm() {
    setTitle("");
    setDescription("");
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setError("");
    try {
      const body = JSON.stringify({ title: title.trim(), description: description.trim() });
      if (editingId) {
        const updated = await request(`/tasks/${editingId}`, { method: "PATCH", body });
        setTasks((current) => current.map((task) => task._id === updated._id ? updated : task));
      } else {
        const created = await request("/tasks", { method: "POST", body });
        setTasks((current) => [created, ...current]);
      }
      resetForm();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  function startEditing(task) {
    setEditingId(task._id);
    setTitle(task.title);
    setDescription(task.description);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleTask(task) {
    setError("");
    try {
      const updated = await request(`/tasks/${task._id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !task.completed })
      });
      setTasks((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch (toggleError) {
      setError(toggleError.message);
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setError("");
    try {
      await request(`/tasks/${task._id}`, { method: "DELETE" });
      setTasks((current) => current.filter((item) => item._id !== task._id));
      if (editingId === task._id) resetForm();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <div className="eyebrow"><span className="status-dot" /> PERSONAL ORGANIZER</div>
        <h1>Make room for<br /><span>what matters.</span></h1>
        <p className="subtitle">A little progress, one task at a time.</p>
      </header>

      <section className="composer panel" aria-label={editingId ? "Edit task" : "Add a task"}>
        <div className="section-heading">
          <div>
            <span className="step-label">{editingId ? "UPDATE TASK" : "NEW TASK"}</span>
            <h2>{editingId ? "Edit your task" : "What’s on your mind?"}</h2>
          </div>
          <span className="sparkle" aria-hidden="true">✳</span>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="task-title">Task title</label>
          <input
            id="task-title"
            className="title-input"
            maxLength={120}
            placeholder="e.g. Take a proper lunch break"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <label className="sr-only" htmlFor="task-description">Task details (optional)</label>
          <textarea
            id="task-description"
            maxLength={1000}
            placeholder="Add a few details (optional)"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows="2"
          />
          <div className="form-footer">
            <span className="hint">Keep it simple. You’ve got this.</span>
            <div className="form-actions">
              {editingId && <button type="button" className="text-button" onClick={resetForm}>Cancel</button>}
              <button className="primary-button" type="submit" disabled={saving || !title.trim()}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Add task"}
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="tasks-section" aria-label="Tasks">
        <div className="list-header">
          <div>
            <span className="step-label">YOUR LIST</span>
            <h2>Tasks <span className="count">{tasks.length}</span></h2>
          </div>
          <p className="remaining">{remaining} left to do</p>
        </div>

        <div className="toolbar">
          <div className="filters" aria-label="Filter tasks">
            {["all", "active", "completed"].map((option) => (
              <button
                className={`filter-button ${filter === option ? "selected" : ""}`}
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                aria-pressed={filter === option}
              >
                {option[0].toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
          <span className="list-note">A good day starts here <span aria-hidden="true">✦</span></span>
        </div>

        {error && (
          <div className="error-message" role="alert">
            <span>{error}</span>
            <button type="button" className="text-button" onClick={loadTasks}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="empty-state"><span className="loader" /> Loading your tasks…</div>
        ) : visibleTasks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">{filter === "all" ? "✳" : "☼"}</span>
            <strong>{filter === "all" ? "A fresh start." : `No ${filter} tasks.`}</strong>
            <span>{filter === "all" ? "Add a task above and make today count." : "Try another filter or add a new task."}</span>
          </div>
        ) : (
          <ul className="task-list">
            {visibleTasks.map((task) => (
              <li className={`task-card ${task.completed ? "is-complete" : ""}`} key={task._id}>
                <button
                  type="button"
                  className="check-button"
                  onClick={() => toggleTask(task)}
                  aria-label={task.completed ? `Mark ${task.title} as active` : `Complete ${task.title}`}
                  aria-pressed={task.completed}
                >
                  {task.completed && <span aria-hidden="true">✓</span>}
                </button>
                <div className="task-copy">
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                </div>
                <div className="task-actions">
                  <button type="button" className="icon-button" onClick={() => startEditing(task)} aria-label={`Edit ${task.title}`}>↗</button>
                  <button type="button" className="icon-button delete-button" onClick={() => deleteTask(task)} aria-label={`Delete ${task.title}`}>×</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="page-footer">
        <span>MADE FOR A MORE MINDFUL DAY</span>
        <span>ONE THING AT A TIME <span aria-hidden="true">✳</span></span>
      </footer>
    </main>
  );
}
