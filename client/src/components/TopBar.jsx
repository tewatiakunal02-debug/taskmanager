import { useAuth } from '../context/AuthContext';

const TopBar = () => {
  const { logout, user } = useAuth();

  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-slate-500">Welcome back,</p>
        <h2 className="text-2xl font-semibold text-slate-900">{user?.name}</h2>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700">{user?.role}</span>
        <button onClick={logout} className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">
          Logout
        </button>
      </div>
    </header>
  );
};

export default TopBar;
