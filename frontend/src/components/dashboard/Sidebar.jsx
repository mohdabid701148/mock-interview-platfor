import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Video,
  CalendarDays,
  History,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Logo from "../Logo";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Open from the Navbar hamburger (decoupled via a window event so pages
  // don't need to pass props down).
  useEffect(() => {
    const open = () => setMobileOpen(true);
    window.addEventListener("toggle-sidebar", open);
    return () => window.removeEventListener("toggle-sidebar", open);
  }, []);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [location.pathname]);

  // Close on Escape; lock body scroll while the drawer is open.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      // logout() clears the in-memory access token and the refresh cookie.
      await logout?.();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const openSettings = () => {
    setMobileOpen(false);
    navigate("/settings", { state: { backgroundLocation: location } });
  };

  const settingsActive = location.pathname === "/settings";

  const content = (
    <div className="flex h-full flex-col px-5 py-6">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2">
        <Logo size={44} />
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
          Sessions
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
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-[#2a2a2a] dark:text-white">
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
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-[#2a2a2a] dark:bg-[#1f1f1f] dark:text-gray-200 dark:hover:bg-[#262626]"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar (lg+) */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white transition-colors duration-300 dark:border-[#2a2a2a] dark:bg-[#111111] lg:flex lg:flex-col">
        {content}
      </aside>

      {/* Mobile drawer (below lg) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop — closes on outside click */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85%] border-r border-slate-200 bg-white shadow-2xl dark:border-[#2a2a2a] dark:bg-[#111111]">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-[#262626]"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
