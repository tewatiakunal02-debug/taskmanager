import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Tasks', path: '/tasks' },
  { label: 'Profile', path: '/profile' }
];

const Sidebar = () => {
  const { user } = useAuth();
  return (
    <aside className="bg-white border-r border-slate-200 w-full lg:w-72 xl:w-80 p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Team Task Manager</h1>
        <p className="text-sm text-slate-500 mt-1">{user?.role} dashboard</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-3 text-slate-700 hover:bg-slate-100 ${isActive ? 'bg-slate-100 font-semibold' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-8 rounded-2xl bg-slate-50 p-4 text-slate-600">
        <h2 className="font-semibold text-slate-900">User Info</h2>
        <p className="mt-2 text-sm">Name: {user?.name}</p>
        <p className="text-sm">Email: {user?.email}</p>
        <p className="text-sm">Role: {user?.role}</p>
      </div>
    </aside>
  );
};

export default Sidebar;
