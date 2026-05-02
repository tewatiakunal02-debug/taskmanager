import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const statusOptions = ['Todo', 'In Progress', 'Done'];
const priorityOptions = ['Low', 'Medium', 'High'];

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', dueDate: '', status: 'Todo', progress: 0, assignedTo: '', projectId: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const loadTasks = async () => {
    const params = filter ? { status: filter } : {};
    const { data } = await api.get('/tasks', { params });
    setTasks(data);
  };
  const loadProjects = async () => {
    const { data } = await api.get('/projects');
    setProjects(data);
  };
  const loadUsers = async () => {
    if (user.role !== 'Admin') return;
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    loadTasks();
    loadProjects();
    loadUsers();
  }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const payload = {
        ...form,
        progress: Number(form.progress)
      };
      if (editing) {
        await api.put(`/tasks/${editing}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      setForm({ title: '', description: '', priority: 'Medium', dueDate: '', status: 'Todo', progress: 0, assignedTo: '', projectId: '' });
      setEditing(null);
      loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save task');
    }
  };

  const handleEdit = (task) => {
    setEditing(task._id);
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate?.slice(0, 10) || '',
      status: task.status,
      progress: task.progress ?? 0,
      assignedTo: task.assignedTo?._id || '',
      projectId: task.projectId?._id || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    loadTasks();
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      loadTasks();
    } catch (err) {
      console.warn(err);
    }
  };

  const updateProgress = async (id, progress) => {
    try {
      await api.put(`/tasks/${id}`, { progress: Number(progress) });
      loadTasks();
    } catch (err) {
      console.warn(err);
    }
  };

  const overdue = (task) => new Date(task.dueDate) < new Date() && task.status !== 'Done';

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Tasks</h1>
          <p className="text-slate-600">Create, assign and track task progress.</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3"
        >
          <option value="">All statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      {user.role === 'Admin' && (
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">{editing ? 'Edit task' : 'Create task'}</h2>
          {error && <div className="mt-4 rounded-xl bg-rose-100 px-4 py-3 text-sm text-rose-700">{error}</div>}
          <form className="mt-4 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title"
              required
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
            />
            <input
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              type="date"
              required
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: e.target.value })}
              placeholder="Progress %"
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              required
              className="col-span-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
            />
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
            >
              {priorityOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              required
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>{project.title}</option>
              ))}
            </select>
            <select
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
            >
              <option value="">Unassigned</option>
              {users.map((member) => (
                <option key={member._id} value={member._id}>{member.name}</option>
              ))}
            </select>
            <div className="col-span-full flex flex-wrap gap-3">
              <button type="submit" className="rounded-2xl bg-slate-900 px-5 py-3 text-white hover:bg-slate-700">
                {editing ? 'Update task' : 'Create task'}
              </button>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setForm({ title: '', description: '', priority: 'Medium', dueDate: '', status: 'Todo', assignedTo: '', projectId: '' }); }} className="rounded-2xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-100">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      )}
      <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Task list</h2>
        <div className="mt-6 space-y-4">
          {tasks.map((task) => (
            <div key={task._id} className={`rounded-3xl border p-5 ${overdue(task) ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                  <p className="mt-1 text-slate-600">Project: {task.projectId?.title || 'Unknown'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{task.priority}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{task.status}</span>
                  {overdue(task) && <span className="rounded-full bg-rose-200 px-3 py-1 text-sm text-rose-800">Overdue</span>}
                </div>
              </div>
              <p className="mt-3 text-slate-600">{task.description}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2 text-sm text-slate-600">
                  <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                  <p>Assigned to: {task.assignedTo?.name || 'Unassigned'}</p>
                  <p>Progress: {task.progress ?? 0}%</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.assignedTo?._id === user._id || user.role === 'Admin' ? (
                    <select
                      value={task.status}
                      onChange={(e) => updateStatus(task._id, e.target.value)}
                      className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="rounded-2xl bg-slate-100 px-3 py-2 text-sm">Status: {task.status}</span>
                  )}
                  {task.assignedTo?._id === user._id || user.role === 'Admin' ? (
                    <select
                      value={task.progress ?? 0}
                      onChange={(e) => updateProgress(task._id, e.target.value)}
                      className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm"
                    >
                      {Array.from({ length: 11 }, (_, index) => index * 10).map((value) => (
                        <option key={value} value={value}>{value}%</option>
                      ))}
                    </select>
                  ) : null}
                  {user.role === 'Admin' && (
                    <>
                      <button onClick={() => handleEdit(task)} className="rounded-2xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(task._id)} className="rounded-2xl border border-rose-300 px-4 py-2 text-rose-700 hover:bg-rose-50">
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!tasks.length && <p className="text-slate-500">No tasks found</p>}
        </div>
      </section>
    </div>
  );
};

export default Tasks;
