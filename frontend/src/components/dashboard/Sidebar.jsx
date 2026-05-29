import { NavLink } from "react-router-dom";
import { LayoutDashboard, Video, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
  }`;

const Sidebar = () => {
  const { logout } = useAuth();

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
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-full flex-col px-5 py-6">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
            M
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">MockMate</h1>
            <p className="text-sm text-slate-500">Interview room system</p>
          </div>
        </div>

        <nav className="mt-10 flex flex-col gap-2">
          <NavLink to="/dashboard" className={linkClass}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink to="/rooms" className={linkClass}>
            <Video size={18} />
            Rooms
          </NavLink>
        </nav>

        <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">MockMate</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage interview rooms and participants in one place.
          </p>

          <button
            onClick={handleLogout}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;