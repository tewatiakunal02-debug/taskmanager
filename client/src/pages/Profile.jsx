import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-900">Profile</h1>
        <p className="text-slate-600">Your account details and role-based access.</p>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 max-w-2xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Name</h2>
            <p className="mt-2 text-lg text-slate-900">{user?.name}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Email</h2>
            <p className="mt-2 text-lg text-slate-900">{user?.email}</p>
          </div>
          <div className="sm:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Role</h2>
            <p className="mt-2 text-lg text-slate-900">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
