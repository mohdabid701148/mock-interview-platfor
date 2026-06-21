import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Lock, Moon, UserRound, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/auth.service";

// Theme-aware fragments (light + dark)
const TILE = "bg-slate-100 dark:bg-[#1f1f1f]";
const BORDER = "border-slate-200 dark:border-[#2a2a2a]";
const ICON = "text-slate-500 dark:text-gray-400";
const SOFT_BTN =
  "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-[#2a2a2a] dark:bg-[#1f1f1f] dark:text-white dark:hover:bg-[#262626]";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const SectionLabel = ({ children }) => (
    <p className="app-muted mb-3 text-xs font-semibold uppercase tracking-wider">
      {children}
    </p>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="app-card flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl shadow-2xl">
        {/* ── Header (sticky) ─────────────────────────────────────────── */}
        <div className={`flex shrink-0 items-center justify-between border-b ${BORDER} px-5 py-4`}>
          <div>
            <h2 className="app-heading text-lg font-semibold">Settings</h2>
            <p className="app-text text-xs">Manage your account and preferences</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${SOFT_BTN}`}
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body (scrollable) ───────────────────────────────────────── */}
        <form
          id="settings-form"
          onSubmit={handleSubmit}
          className="app-bg flex-1 space-y-7 overflow-y-auto px-5 py-5"
        >
          {message && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {message}
            </div>
          )}

          {/* Profile */}
          <section>
            <SectionLabel>Profile</SectionLabel>

            <div className="mb-4 flex items-center gap-4">
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold ${TILE} text-slate-700 dark:text-white`}>
                {initials}
              </div>
              <div className="min-w-0">
                <p className="app-heading truncate text-sm font-semibold">
                  {user?.fullName || user?.username || "Your name"}
                </p>
                <p className="app-text truncate text-xs">{user?.email || ""}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="app-heading mb-1.5 block text-sm font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="app-input w-full rounded-xl px-4 py-2.5 outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="app-heading mb-1.5 block text-sm font-medium">
                  Bio
                </label>
                <textarea
                  rows="3"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="app-input w-full rounded-xl px-4 py-2.5 outline-none"
                  placeholder="Write a short bio"
                />
              </div>

              <div>
                <label className="app-heading mb-1.5 block text-sm font-medium">
                  Status
                </label>
                <input
                  type="text"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="app-input w-full rounded-xl px-4 py-2.5 outline-none"
                  placeholder="e.g. Available for interviews"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="app-heading mb-1.5 block text-sm font-medium">
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    className="app-input w-full rounded-xl px-4 py-2.5 outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="app-heading mb-1.5 block text-sm font-medium">
                    Cover Image URL
                  </label>
                  <input
                    type="text"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    className="app-input w-full rounded-xl px-4 py-2.5 outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section>
            <SectionLabel>Preferences</SectionLabel>

            <div className="space-y-3">
              {/* Notifications */}
              <div className={`flex items-center justify-between gap-3 rounded-2xl border ${BORDER} ${TILE} p-4`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#2a2a2a]">
                    <Bell size={16} className={ICON} />
                  </div>
                  <div>
                    <h4 className="app-heading text-sm font-medium">
                      Interview reminders
                    </h4>
                    <p className="app-text text-xs">
                      Notify me about upcoming interviews.
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
                  <div className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-blue-600 dark:bg-white/15 dark:peer-checked:bg-blue-500 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-5" />
                </label>
              </div>

              {/* Appearance */}
              <div className={`flex items-center justify-between gap-3 rounded-2xl border ${BORDER} ${TILE} p-4`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#2a2a2a]">
                    <Moon size={16} className={ICON} />
                  </div>
                  <div>
                    <h4 className="app-heading text-sm font-medium">Appearance</h4>
                    <p className="app-text text-xs">
                      {darkMode ? "Dark theme" : "Light theme"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDarkMode((prev) => !prev)}
                  aria-label="Toggle theme"
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-300 ${
                    darkMode ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-[2px] h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${
                      darkMode ? "left-[22px]" : "left-[2px]"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Account */}
          <section>
            <SectionLabel>Account</SectionLabel>

            <div className="space-y-3">
              <div className={`flex items-center justify-between gap-3 rounded-2xl border ${BORDER} ${TILE} p-4`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#2a2a2a]">
                    <Lock size={16} className={ICON} />
                  </div>
                  <div>
                    <h4 className="app-heading text-sm font-medium">
                      Email verification
                    </h4>
                    <p className="app-text text-xs">
                      {user?.isVerified ? "Your email is verified." : "Not verified yet."}
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

              <div className="grid gap-3 sm:grid-cols-2">
                <div className={`rounded-2xl border ${BORDER} ${TILE} p-4`}>
                  <p className="app-muted text-xs uppercase tracking-wide">Username</p>
                  <p className="app-heading mt-1 truncate text-sm font-medium">
                    {user?.username || "--"}
                  </p>
                </div>
                <div className={`rounded-2xl border ${BORDER} ${TILE} p-4`}>
                  <p className="app-muted text-xs uppercase tracking-wide">
                    Member since
                  </p>
                  <p className="app-heading mt-1 text-sm font-medium">{memberSince}</p>
                </div>
                <div className={`rounded-2xl border ${BORDER} ${TILE} p-4 sm:col-span-2`}>
                  <p className="app-muted text-xs uppercase tracking-wide">Email</p>
                  <p className="app-heading mt-1 break-words text-sm font-medium">
                    {user?.email || "--"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </form>

        {/* ── Footer (sticky) ─────────────────────────────────────────── */}
        <div className={`flex shrink-0 items-center justify-end gap-3 border-t ${BORDER} px-5 py-4`}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${SOFT_BTN}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="settings-form"
            disabled={loading}
            className="app-btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
