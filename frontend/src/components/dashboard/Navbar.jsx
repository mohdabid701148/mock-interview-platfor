import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import NotificationBell from "./NotificationBell";

const Navbar = ({
  title = "Dashboard",
  subtitle = "",
  onCreateRoom,
  searchValue,
  onSearchChange,
  placeholder = "Search rooms...",
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showMenu, setShowMenu] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchValue || "");

  // Sync local search state with parent prop if provided
  useEffect(() => {
    if (searchValue !== undefined) {
      setLocalSearch(searchValue);
    }
  }, [searchValue]);

  const handleLogout = async () => {
    try {
      await logout?.();
    } catch (error) {
      console.log("Logout error:", error?.response?.data || error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      window.dispatchEvent(new Event("auth-change"));

      setShowMenu(false);

      navigate("/login", { replace: true });
    }
  };

  const openWithBackground = (path) => {
    navigate(path, {
      state: { backgroundLocation: location },
    });
    setShowMenu(false);
  };

  const executeSearch = (query) => {
    if (onSearchChange) {
      onSearchChange(query);
    } else {
      navigate(`/rooms?search=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      executeSearch(localSearch);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const initials =
    user?.username?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 transition-colors duration-300 dark:border-[#2a2a2a] dark:bg-[#171717] md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm text-slate-500 dark:text-gray-400">
          Welcome back 👋
        </p>

        <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 cursor-pointer"
            onClick={() => executeSearch(localSearch)}
          />
          <input
            type="text"
            placeholder={placeholder}
            value={localSearch}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="
              w-64
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              py-2
              pl-10
              pr-4
              text-sm
              outline-none
              transition
              focus:border-slate-900
              focus:bg-white
              dark:border-[#2a2a2a]
              dark:bg-[#1f1f1f]
              dark:text-white
              dark:placeholder:text-gray-500
              dark:focus:border-[#404040]
            "
          />
        </div>

        <NotificationBell />

        {onCreateRoom && (
          <button
            onClick={onCreateRoom}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-slate-900
              px-5
              py-3
              text-sm
              font-medium
              text-white
              transition
              hover:bg-slate-800
              dark:bg-white
              dark:text-black
              dark:hover:bg-gray-200
            "
          >
            <Plus size={16} />
            New Room
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-3
              py-2
              transition
              hover:bg-slate-100
              dark:border-[#2a2a2a]
              dark:bg-[#1f1f1f]
              dark:hover:bg-[#262626]
            "
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white dark:bg-[#2a2a2a]">
              {initials}
            </div>

            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {user?.username || "User"}
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Account
              </p>
            </div>

            <ChevronDown
              size={16}
              className="text-slate-500 dark:text-gray-400"
            />
          </button>

          {showMenu && (
            <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-[#2a2a2a] dark:bg-[#171717]">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-[#2a2a2a]">
                <p className="font-medium text-slate-900 dark:text-white">
                  {user?.username}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>

              <button
                onClick={() => openWithBackground("/profile")}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-[#262626]"
              >
                <User size={16} />
                My Profile
              </button>

              <button
                onClick={() => openWithBackground("/settings")}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-[#262626]"
              >
                <Settings size={16} />
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;