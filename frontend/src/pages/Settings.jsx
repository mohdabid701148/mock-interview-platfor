import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronRight,
  Lock,
  Moon,
  Settings2,
  Shield,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/auth.service";

const menuItems = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "personalization", label: "Personalization", icon: Sparkles },
  { id: "security", label: "Security", icon: Shield },
  { id: "account", label: "Account", icon: UserRound },
];

// Theme-aware helper class fragments (light + dark)
const TILE = "bg-slate-100 dark:bg-[#1f1f1f]";
const BORDER = "border-slate-200 dark:border-[#2a2a2a]";
const ICON = "text-slate-500 dark:text-gray-400";
const SOFT_BTN =
  "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#1f1f1f] dark:text-white dark:hover:bg-[#262626]";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const sectionRefs = useRef({});
  const [activeSection, setActiveSection] = useState("general");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    status: "",
    avatar: "",
    coverImage: "",
    notificationsEnabled: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        bio: user.bio || "",
        status: user.status || "",
        avatar: user.avatar || "",
        coverImage: user.coverImage || "",
        notificationsEnabled: user.notificationsEnabled ?? true,
      });
    }
  }, [user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const scrollToSection = (id) => {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage("");
      const res = await authService.updateProfile(formData);
      setMessage(res?.message || "Profile updated successfully");
      setTimeout(() => window.location.reload(), 900);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const initials =
    user?.fullName?.charAt(0)?.toUpperCase() ||
    user?.username?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  const memberSince = user?.createdAt
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
        new Date(user.createdAt)
      )
    : "--";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-2 backdrop-blur-sm sm:p-3">
      <div className="app-card flex h-[calc(100vh-1rem)] w-full max-w-6xl overflow-hidden rounded-2xl shadow-2xl sm:h-[calc(100vh-1.5rem)] sm:rounded-[28px]">
        {/* ── Sidebar (md+) ───────────────────────────────────────────── */}
        <aside className={`hidden w-72 shrink-0 border-r ${BORDER} bg-slate-50 p-4 dark:bg-[#111111] md:flex md:flex-col`}>
          <button
            onClick={() => navigate(-1)}
            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition ${SOFT_BTN}`}
            aria-label="Close settings"
          >
            <X size={20} />
          </button>

          <div className="mb-6 px-2">
            <h1 className="app-heading text-xl font-semibold">Settings</h1>
            <p className="app-text mt-1 text-sm">
              Manage your account and preferences
            </p>
          </div>

          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-200 text-slate-900 dark:bg-[#2a2a2a] dark:text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-[#262626] dark:hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className={`mt-auto rounded-3xl border ${BORDER} bg-white p-4 dark:bg-[#171717]`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${TILE} text-slate-700 dark:text-white`}>
                {initials}
              </div>
              <div className="min-w-0">
                <p className="app-heading truncate text-sm font-semibold">
                  {user?.fullName || user?.username || "User"}
                </p>
                <p className="app-text truncate text-xs">{user?.email || ""}</p>
              </div>
            </div>

            <button
              onClick={() => scrollToSection("account")}
              className={`mt-4 flex w-full items-center justify-between rounded-2xl border ${BORDER} px-4 py-3 text-sm font-medium transition ${SOFT_BTN}`}
            >
              Account details
              <ChevronRight size={16} />
            </button>
          </div>
        </aside>

        {/* ── Main ────────────────────────────────────────────────────── */}
        <main className="app-bg flex-1 overflow-y-auto p-4 sm:p-5 md:px-8 md:py-6">
          <div className="mx-auto max-w-4xl">
            {/* Mobile header */}
            <div className="mb-5 flex items-center justify-between md:hidden">
              <button
                onClick={() => navigate(-1)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${SOFT_BTN}`}
                aria-label="Back"
              >
                <X size={18} />
              </button>
              <h2 className="app-heading text-lg font-semibold">Settings</h2>
              <div className="h-11 w-11" />
            </div>

            <div className={`border-b ${BORDER} pb-5`}>
              <h2 className="app-heading text-2xl font-semibold sm:text-3xl">
                Settings
              </h2>
              <p className="app-text mt-1 text-sm">
                Manage your profile, notifications, and appearance.
              </p>
            </div>

            {message && (
              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 pb-10 pt-6">
              {/* General */}
              <section
                id="general"
                ref={(el) => { sectionRefs.current.general = el; }}
                className="app-card rounded-[26px] p-5 sm:p-6"
              >
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="app-heading text-lg font-semibold sm:text-xl">
                      General
                    </h3>
                    <p className="app-text mt-1 text-sm">
                      Basic profile information shown across the app
                    </p>
                  </div>
                  <div className={`shrink-0 rounded-full ${TILE} px-3 py-1 text-xs ${ICON}`}>
                    Profile
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-[180px_1fr]">
                  <div className="app-panel rounded-3xl p-5">
                    <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full border text-4xl font-bold sm:mx-0 sm:h-28 sm:w-28 ${BORDER} ${TILE} text-slate-700 dark:text-white`}>
                      {initials}
                    </div>
                    <div className="mt-4 text-center sm:text-left">
                      <p className="app-heading text-sm font-medium">
                        {user?.fullName || user?.username || "Your name"}
                      </p>
                      <p className="app-text mt-1 text-xs">Avatar preview</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label className="app-heading mb-2 block text-sm font-medium">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="app-input w-full rounded-2xl px-4 py-3 outline-none"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="app-heading mb-2 block text-sm font-medium">
                        Bio
                      </label>
                      <textarea
                        rows="4"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="app-input w-full rounded-2xl px-4 py-3 outline-none"
                        placeholder="Write a short bio"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="app-heading mb-2 block text-sm font-medium">
                          Status
                        </label>
                        <input
                          type="text"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="app-input w-full rounded-2xl px-4 py-3 outline-none"
                          placeholder="e.g. Available for interviews"
                        />
                      </div>

                      <div className="app-panel flex items-center gap-3 rounded-2xl px-4 py-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TILE}`}>
                          <UserRound size={18} className={ICON} />
                        </div>
                        <div className="min-w-0">
                          <p className="app-heading text-sm font-medium">
                            {user?.username || "username"}
                          </p>
                          <p className="app-text truncate text-xs">
                            {user?.email || "email"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="app-heading mb-2 block text-sm font-medium">
                          Avatar URL
                        </label>
                        <input
                          type="text"
                          name="avatar"
                          value={formData.avatar}
                          onChange={handleChange}
                          className="app-input w-full rounded-2xl px-4 py-3 outline-none"
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className="app-heading mb-2 block text-sm font-medium">
                          Cover Image URL
                        </label>
                        <input
                          type="text"
                          name="coverImage"
                          value={formData.coverImage}
                          onChange={handleChange}
                          className="app-input w-full rounded-2xl px-4 py-3 outline-none"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Notifications */}
              <section
                id="notifications"
                ref={(el) => { sectionRefs.current.notifications = el; }}
                className="app-card rounded-[26px] p-5 sm:p-6"
              >
                <div className="mb-5">
                  <h3 className="app-heading text-lg font-semibold sm:text-xl">
                    Notifications
                  </h3>
                  <p className="app-text mt-1 text-sm">
                    Choose what updates you want to receive
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="app-panel flex items-center justify-between gap-3 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TILE}`}>
                        <Bell size={18} className={ICON} />
                      </div>
                      <div>
                        <h4 className="app-heading font-medium">
                          Interview reminders
                        </h4>
                        <p className="app-text mt-1 text-sm">
                          Get notified about upcoming mock interviews and schedule changes.
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                      <input
                        type="checkbox"
                        name="notificationsEnabled"
                        checked={formData.notificationsEnabled}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <div className="relative h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-blue-600 dark:bg-white/15 dark:peer-checked:bg-blue-500 after:absolute after:left-[2px] after:top-[2px] after:h-6 after:w-6 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-5" />
                    </label>
                  </div>

                  <div className="app-panel rounded-2xl p-4 text-sm app-text sm:p-5">
                    Notification setting is synced with your profile update API.
                  </div>
                </div>
              </section>

              {/* Personalization */}
              <section
                id="personalization"
                ref={(el) => { sectionRefs.current.personalization = el; }}
                className="app-card rounded-[26px] p-5 sm:p-6"
              >
                <div className="mb-5">
                  <h3 className="app-heading text-lg font-semibold sm:text-xl">
                    Personalization
                  </h3>
                  <p className="app-text mt-1 text-sm">
                    Match the app look to your preference
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="app-panel flex items-center justify-between gap-3 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TILE}`}>
                        <Moon size={18} className={ICON} />
                      </div>
                      <div>
                        <h4 className="app-heading font-medium">Appearance</h4>
                        <p className="app-text mt-1 text-sm">
                          Switch between light and dark theme.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDarkMode((prev) => !prev)}
                      aria-label="Toggle theme"
                      className={`relative h-8 w-16 shrink-0 rounded-full transition-all duration-300 ${
                        darkMode ? "bg-blue-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                          darkMode ? "left-9" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="app-panel rounded-2xl p-4 sm:p-5">
                    <h4 className="app-heading font-medium">Current theme</h4>
                    <p className="app-text mt-1 text-sm">
                      {darkMode ? "Dark" : "Light"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Security */}
              <section
                id="security"
                ref={(el) => { sectionRefs.current.security = el; }}
                className="app-card rounded-[26px] p-5 sm:p-6"
              >
                <div className="mb-5">
                  <h3 className="app-heading text-lg font-semibold sm:text-xl">
                    Security
                  </h3>
                  <p className="app-text mt-1 text-sm">
                    Your account protection status
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="app-panel flex items-center justify-between gap-3 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TILE}`}>
                        <Lock size={18} className={ICON} />
                      </div>
                      <div>
                        <h4 className="app-heading font-medium">
                          Email verification
                        </h4>
                        <p className="app-text mt-1 text-sm">
                          {user?.isVerified
                            ? "Your email address is verified."
                            : "Your email address is not verified yet."}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        user?.isVerified
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {user?.isVerified ? "Verified" : "Pending"}
                    </span>
                  </div>

                  <div className="app-panel rounded-2xl p-4 text-sm app-text sm:p-5">
                    Your account is protected with email + password login. Keep your
                    password private and never share it with anyone.
                  </div>
                </div>
              </section>

              {/* Account */}
              <section
                id="account"
                ref={(el) => { sectionRefs.current.account = el; }}
                className="app-card rounded-[26px] p-5 sm:p-6"
              >
                <div className="mb-5">
                  <h3 className="app-heading text-lg font-semibold sm:text-xl">
                    Account
                  </h3>
                  <p className="app-text mt-1 text-sm">Your account summary</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="app-panel rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-wide app-muted">Email</p>
                    <p className="app-heading mt-2 break-words text-sm font-medium">
                      {user?.email || "--"}
                    </p>
                  </div>

                  <div className="app-panel rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-wide app-muted">
                      Member since
                    </p>
                    <p className="app-heading mt-2 text-sm font-medium">
                      {memberSince}
                    </p>
                  </div>

                  <div className="app-panel rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-wide app-muted">
                      Username
                    </p>
                    <p className="app-heading mt-2 text-sm font-medium">
                      {user?.username || "--"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
                    <p className="text-xs uppercase tracking-wide text-red-500 dark:text-red-300">
                      Danger zone
                    </p>
                    <p className="app-text mt-2 text-sm">
                      Account deletion is not enabled here.
                    </p>
                  </div>
                </div>
              </section>

              {/* Footer actions */}
              <div className={`flex flex-col gap-3 border-t ${BORDER} pt-4 md:flex-row md:items-center md:justify-between`}>
                <p className="app-text text-sm">
                  Changes are saved to your profile update API.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className={`flex-1 rounded-full border ${BORDER} px-5 py-3 text-sm font-medium transition md:flex-none ${SOFT_BTN}`}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="app-btn-primary flex-1 rounded-full px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 md:flex-none"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
