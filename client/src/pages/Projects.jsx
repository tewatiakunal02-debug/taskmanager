import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', deadline: '', members: '', status: 'Active', progress: 0 });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

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
      console.warn('Unable to fetch users', err);
    }
  };

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const payload = {
        title: form.title,
        description: form.description,
        deadline: form.deadline,
        members: form.members ? form.members.split(',').map((id) => id.trim()).filter(Boolean) : [],
        status: form.status,
        progress: Number(form.progress)
      };
      if (editing) {
        await api.put(`/projects/${editing}`, payload);
      } else {
        await api.post('/projects', payload);
      }
      setForm({ title: '', description: '', deadline: '', members: '', status: 'Active', progress: 0 });
      setEditing(null);
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save project');
    }
  };

  const handleEdit = (project) => {
    setEditing(project._id);
    setForm({
      title: project.title,
      description: project.description,
      deadline: project.deadline?.slice(0, 10) || '',
      members: project.members?.map((member) => member._id).join(',') || '',
      status: project.status,
      progress: project.progress || 0
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await api.delete(`/projects/${id}`);
    loadProjects();
  };

  const updateProjectProgress = async (id, progress) => {
    try {
      await api.put(`/projects/${id}`, { progress: Number(progress) });
      loadProjects();
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Projects</h1>
          <p className="text-slate-600">Manage your project portfolio and team assignments.</p>
        </div>
      </div>
      {user.role === 'Admin' && (
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">{editing ? 'Edit project' : 'Create project'}</h2>
          {error && <div className="mt-4 rounded-xl bg-rose-100 px-4 py-3 text-sm text-rose-700">{error}</div>}
          <form className="mt-4 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title"
              required
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
            />
            <input
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              type="date"
              required
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              required
              className="col-span-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
            />
            <input
              value={form.members}
              onChange={(e) => setForm({ ...form, members: e.target.value })}
              placeholder="Member IDs comma separated"
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
            >
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
            <input
              type="number"
              min="0"
              max="100"
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: e.target.value })}
              placeholder="Progress %"
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
            />
            <div className="col-span-full flex flex-wrap gap-3">
              <button type="submit" className="rounded-2xl bg-slate-900 px-5 py-3 text-white hover:bg-slate-700">
                {editing ? 'Update project' : 'Create project'}
              </button>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setForm({ title: '', description: '', deadline: '', members: '', status: 'Active', progress: 0 }); }} className="rounded-2xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-100">
                  Cancel
                </button>
              )}
            </div>
          </form>
          {users.length > 0 && (
            <div className="mt-4 text-sm text-slate-500">
              <p>Available members for IDs:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {users.map((member) => (
                  <span key={member._id} className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{member.name} ({member._id})</span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
      <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Project list</h2>
        <div className="mt-6 space-y-4">
          {projects.map((project) => {
            const isMember = project.members?.some((member) => member._id === user._id);
            return (
              <div key={project._id} className="rounded-3xl border border-slate-200 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{project.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.role === 'Admin' && (
                      <button onClick={() => handleEdit(project)} className="rounded-2xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">
                        Edit
                      </button>
                    )}
                    {user.role === 'Admin' && (
                      <button onClick={() => handleDelete(project._id)} className="rounded-2xl border border-rose-300 px-4 py-2 text-rose-700 hover:bg-rose-50">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-slate-600">{project.description}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                  <span className="rounded-full bg-slate-100 px-3 py-1">Status: {project.status}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Progress: {project.progress}%</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Members: {project.members?.length || 0}</span>
                </div>
                {(user.role === 'Admin' || isMember) && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <label className="text-sm font-medium text-slate-700">Update progress</label>
                    <select
                      value={project.progress ?? 0}
                      onChange={(e) => updateProjectProgress(project._id, e.target.value)}
                      className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm"
                    >
                      {Array.from({ length: 11 }, (_, index) => index * 10).map((value) => (
                        <option key={value} value={value}>
                          {value}%
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
          {!projects.length && <p className="text-slate-500">No projects found</p>}
        </div>
      </section>
    </div>
  );
};

export default Projects;
