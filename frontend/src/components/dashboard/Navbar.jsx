import { Bell, Plus, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Navbar = ({ title = "Dashboard", subtitle = "", onCreateRoom }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/login");
    }
  };

  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm text-slate-500">Welcome back</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>

      <div className="flex items-center gap-3">
        <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100">
          <Bell size={18} />
        </button>

        {onCreateRoom ? (
          <button
            onClick={onCreateRoom}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus size={17} />
            New Room
          </button>
        ) : null}

        <div className="hidden rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 md:block">
          <p className="text-sm font-medium text-slate-900">{user?.username || "User"}</p>
          <p className="text-xs text-slate-500">{user?.email || ""}</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-red-500 hover:text-white hover:border-red-500"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;