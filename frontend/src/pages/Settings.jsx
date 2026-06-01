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

      setTimeout(() => {
        window.location.reload();
      }, 900);
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to update profile"
      );
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
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
      }).format(new Date(user.createdAt))
    : "--";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm">
      <div className="app-card flex h-[calc(100vh-1.5rem)] w-full max-w-6xl overflow-hidden rounded-[28px] shadow-2xl">
        <aside className="hidden w-72 shrink-0 border-r border-[#2a2a2a] bg-[#111111] p-4 md:flex md:flex-col">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f1f1f] text-white transition hover:bg-[#262626]"
            aria-label="Close settings"
          >
            <X size={20} />
          </button>

          <div className="mb-6 px-2">
            <h1 className="app-heading text-xl font-semibold">
              Settings
            </h1>
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
                      ? "bg-[#2a2a2a] text-white"
                      : "text-gray-400 hover:bg-[#262626] hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-3xl border border-[#2a2a2a] bg-[#171717] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1f1f1f] text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="app-heading truncate text-sm font-semibold">
                  {user?.fullName || user?.username || "User"}
                </p>
                <p className="app-text truncate text-xs">
                  {user?.email || ""}
                </p>
              </div>
            </div>

            <button
              onClick={() => scrollToSection("account")}
              className="mt-4 flex w-full items-center justify-between rounded-2xl border border-[#2a2a2a] bg-[#1f1f1f] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#262626]"
            >
              Account details
              <ChevronRight size={16} />
            </button>
          </div>
        </aside>

        <main className="app-bg flex-1 overflow-y-auto p-5 md:px-8 md:py-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-5 flex items-center justify-between md:hidden">
              <button
                onClick={() => navigate(-1)}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1f1f1f] text-white"
                aria-label="Back"
              >
                <X size={18} />
              </button>

              <h2 className="app-heading text-lg font-semibold">
                Settings
              </h2>

              <div className="h-11 w-11" />
            </div>

            <div className="border-b border-[#2a2a2a] pb-5">
              <h2 className="app-heading text-3xl font-semibold">
                General
              </h2>
            </div>

            {message && (
              <div className="mt-5 rounded-2xl border border-[#2a2a2a] bg-[#1f1f1f] px-4 py-3 text-sm text-gray-200">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 pb-10 pt-6">
              <section className="rounded-[26px] bg-[#171717] p-6 shadow-lg">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-2xl">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#2a2a2a] bg-[#1f1f1f]">
                      <Shield size={22} className="text-white" />
                    </div>

                    <h3 className="app-heading text-xl font-semibold">
                      Secure your account
                    </h3>

                    <p className="app-text mt-2 max-w-2xl text-sm leading-7">
                      Update your profile, notification preferences, and appearance.
                      Keep your workspace clean and easy to use.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollToSection("security")}
                    className="inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#1f1f1f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#262626]"
                  >
                    Review security
                    <ChevronRight size={16} />
                  </button>
                </div>
              </section>

              <section
                id="general"
                ref={(el) => {
                  sectionRefs.current.general = el;
                }}
                className="app-card rounded-[26px] p-6"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h3 className="app-heading text-xl font-semibold">
                      General
                    </h3>
                    <p className="app-text mt-1 text-sm">
                      Basic profile information shown across the app
                    </p>
                  </div>

                  <div className="rounded-full bg-[#1f1f1f] px-3 py-1 text-xs text-gray-400">
                    Profile
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-[180px_1fr]">
                  <div className="app-panel rounded-3xl p-5">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#1f1f1f] text-4xl font-bold text-white">
                      {initials}
                    </div>

                    <div className="mt-4">
                      <p className="app-heading text-sm font-medium">
                        {user?.fullName || user?.username || "Your name"}
                      </p>
                      <p className="app-text mt-1 text-xs">
                        Avatar preview
                      </p>
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

                    <div className="grid gap-4 md:grid-cols-2">
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f1f1f]">
                          <UserRound size={18} className="text-gray-400" />
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

                    <div className="grid gap-4 md:grid-cols-2">
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

              <section
                id="notifications"
                ref={(el) => {
                  sectionRefs.current.notifications = el;
                }}
                className="app-card rounded-[26px] p-6"
              >
                <div className="mb-5">
                  <h3 className="app-heading text-xl font-semibold">
                    Notifications
                  </h3>
                  <p className="app-text mt-1 text-sm">
                    Choose what updates you want to receive
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="app-panel flex items-center justify-between rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f1f1f]">
                        <Bell size={18} className="text-gray-400" />
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

                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        name="notificationsEnabled"
                        checked={formData.notificationsEnabled}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <div className="relative h-7 w-12 rounded-full bg-black/20 transition peer-checked:bg-white/80 dark:bg-white/15 dark:peer-checked:bg-white/80 after:absolute after:left-[2px] after:top-[2px] after:h-6 after:w-6 after:rounded-full after:border after:border-white/10 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-5" />
                    </label>
                  </div>

                  <div className="app-panel rounded-2xl p-5 text-sm text-gray-400">
                    Notification setting is synced with your profile update API.
                  </div>
                </div>
              </section>

              <section
                id="personalization"
                ref={(el) => {
                  sectionRefs.current.personalization = el;
                }}
                className="app-card rounded-[26px] p-6"
              >
                <div className="mb-5">
                  <h3 className="app-heading text-xl font-semibold">
                    Personalization
                  </h3>
                  <p className="app-text mt-1 text-sm">
                    Match the app look to your preference
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="app-panel flex items-center justify-between rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f1f1f]">
                        <Moon size={18} className="text-gray-400" />
                      </div>
                      <div>
                        <h4 className="app-heading font-medium">
                          Appearance
                        </h4>
                        <p className="app-text mt-1 text-sm">
                          Use a soft dark theme with neutral gray panels.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDarkMode((prev) => !prev)}
                      className={`relative h-8 w-16 rounded-full transition-all duration-300 ${
                        darkMode ? "bg-white/80" : "bg-black/20"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-6 w-6 rounded-full bg-[#1f1f1f] shadow-md transition-all duration-300 ${
                          darkMode ? "left-9" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="app-panel rounded-2xl p-5">
                    <h4 className="app-heading font-medium">Current theme</h4>
                    <p className="app-text mt-1 text-sm">
                      {darkMode ? "Dark" : "Light"}
                    </p>
                  </div>
                </div>
              </section>

              <section
                id="security"
                ref={(el) => {
                  sectionRefs.current.security = el;
                }}
                className="app-card rounded-[26px] p-6"
              >
                <div className="mb-5">
                  <h3 className="app-heading text-xl font-semibold">
                    Security
                  </h3>
                  <p className="app-text mt-1 text-sm">
                    Keep your account protected
                  </p>
                </div>

                <div className="rounded-[24px] bg-black p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-2xl">
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#2a2a2a] bg-[#1f1f1f]">
                        <Lock size={20} className="text-white" />
                      </div>

                      <h4 className="text-lg font-semibold text-white">
                        Protect your account
                      </h4>

                      <p className="mt-2 text-sm leading-7 text-gray-400">
                        Use a strong password and keep notifications enabled so you
                        never miss an important interview update.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/settings")}
                      className="rounded-full border border-[#2a2a2a] bg-[#1f1f1f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#262626]"
                    >
                      Change password
                    </button>
                  </div>
                </div>
              </section>

              <section
                id="account"
                ref={(el) => {
                  sectionRefs.current.account = el;
                }}
                className="app-card rounded-[26px] p-6"
              >
                <div className="mb-5">
                  <h3 className="app-heading text-xl font-semibold">
                    Account
                  </h3>
                  <p className="app-text mt-1 text-sm">
                    Your account summary
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="app-panel rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Email
                    </p>
                    <p className="app-heading mt-2 text-sm font-medium">
                      {user?.email || "--"}
                    </p>
                  </div>

                  <div className="app-panel rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Member since
                    </p>
                    <p className="app-heading mt-2 text-sm font-medium">
                      {memberSince}
                    </p>
                  </div>

                  <div className="app-panel rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Username
                    </p>
                    <p className="app-heading mt-2 text-sm font-medium">
                      {user?.username || "--"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                    <p className="text-xs uppercase tracking-wide text-red-300">
                      Danger zone
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                      Account deletion is not enabled here.
                    </p>
                  </div>
                </div>
              </section>

              <div className="flex flex-col gap-3 border-t border-[#2a2a2a] pt-4 md:flex-row md:items-center md:justify-between">
                <p className="app-text text-sm">
                  Changes are saved to your profile update API.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="rounded-full border border-[#2a2a2a] bg-[#1f1f1f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#262626]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
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