import { useEffect, useState } from 'react';
import api from '../utils/api';

const statCards = [
  { label: 'Projects', key: 'totalProjects', color: 'from-slate-700 to-slate-900' },
  { label: 'Tasks', key: 'totalTasks', color: 'from-indigo-600 to-indigo-800' },
  { label: 'Completed', key: 'completedTasks', color: 'from-emerald-600 to-emerald-800' },
  { label: 'Pending', key: 'pendingTasks', color: 'from-amber-500 to-orange-600' },
  { label: 'Overdue', key: 'overdueTasks', color: 'from-rose-600 to-red-700' }
];

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Dashboard fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-600">
          Overview of your team productivity and task progress.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.key}
            className={`rounded-2xl bg-gradient-to-br ${card.color} p-6 text-white shadow-md`}
          >
            <p className="text-sm uppercase tracking-widest text-white/80">
              {card.label}
            </p>

            <p className="mt-4 text-4xl font-bold">
              {loading ? '...' : stats[card.key] ?? 0}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Recent Tasks */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Recent Tasks</h2>

          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-slate-500">Loading...</p>
            ) : stats.recentTasks?.length ? (
              stats.recentTasks.map((task) => (
                <div
                  key={task._id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <p className="font-semibold text-slate-900">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Status: {task.status}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No tasks found</p>
            )}
          </div>
        </section>

        {/* Project Progress */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="text-xl font-semibold text-slate-900">
            Project Progress
          </h2>

          <div className="mt-4 space-y-4">
            {loading ? (
              <p className="text-slate-500">Loading...</p>
            ) : stats.projectProgress?.length ? (
              stats.projectProgress.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">
                      {project.title}
                    </p>
                    <span className="text-sm text-slate-500">
                      {project.status}
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Progress: {project.progress}%
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No projects to show</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;