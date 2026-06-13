import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Video,
  CalendarDays,
  History,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "bg-slate-900 text-white dark:bg-[#2a2a2a] dark:text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-[#262626] dark:hover:text-white"
  }`;

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout?.();
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/login");
    }
  };

  const openSettings = () => {
    navigate("/settings", {
      state: { backgroundLocation: location },
    });
  };

  const settingsActive = location.pathname === "/settings";

  return (
    <aside className="sticky top-0 hidden h-screen w-72 border-r border-slate-200 bg-white transition-colors duration-300 dark:border-[#2a2a2a] dark:bg-[#111111] lg:flex lg:flex-col">
      <div className="flex h-full flex-col px-5 py-6">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 font-bold text-white dark:bg-[#2a2a2a] dark:text-white">
            M
          </div>

          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              MockMate
            </h1>

            <p className="text-sm text-slate-500 dark:text-gray-400">
              Interview Platform
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-10 flex flex-col gap-2">
          <NavLink to="/dashboard" className={linkClass}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink to="/rooms" className={linkClass}>
            <Video size={18} />
            Rooms
          </NavLink>

          <NavLink to="/schedule" className={linkClass}>
            <CalendarDays size={18} />
            Schedule
          </NavLink>

          <NavLink to="/history" className={linkClass}>
            <History size={18} />
            History
          </NavLink>

          <button
            onClick={openSettings}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
              settingsActive
                ? "bg-slate-900 text-white dark:bg-[#2a2a2a] dark:text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-[#262626] dark:hover:text-white"
            }`}
          >
            <Settings size={18} />
            Settings
          </button>
        </nav>

        {/* User Card */}
        <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors duration-300 dark:border-[#2a2a2a] dark:bg-[#171717]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-[#2a2a2a] dark:text-white">
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {user?.username}
              </h3>

              <p className="truncate text-xs text-slate-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="
              mt-4
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-300
              bg-white
              px-4
              py-3
              text-sm
              font-medium
              text-slate-700
              transition-all
              duration-200
              hover:bg-slate-100

              dark:border-[#2a2a2a]
              dark:bg-[#1f1f1f]
              dark:text-gray-200
              dark:hover:bg-[#262626]
            "
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