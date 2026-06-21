import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  FileText,
  Activity,
  Bell,
  X,
} from "lucide-react";

const Profile = ({ modal = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const initials =
    user?.username?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  const profileContent = (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-[#2a2a2a] dark:bg-[#171717]">
      <div className="h-40 bg-gradient-to-r from-slate-900 to-slate-700" />

      <div className="relative px-8 pb-8">
        {modal && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        )}

        <div className="-mt-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-slate-900 text-3xl font-bold text-white">
          {initials}
        </div>

        <div className="mt-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {user?.fullName || user?.username || "User"}
          </h2>

          <p className="mt-1 text-slate-500 dark:text-gray-400">
            @{user?.username || "username"}
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-5 dark:border-[#2a2a2a]">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <User size={18} />
              <span className="font-medium">Full Name</span>
            </div>

            <p className="mt-3 text-slate-600 dark:text-gray-400">
              {user?.fullName || "Not Added"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5 dark:border-[#2a2a2a]">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <Mail size={18} />
              <span className="font-medium">Email</span>
            </div>

            <p className="mt-3 text-slate-600 dark:text-gray-400">
              {user?.email || "No email"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5 dark:border-[#2a2a2a]">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <FileText size={18} />
              <span className="font-medium">Bio</span>
            </div>

            <p className="mt-3 text-slate-600 dark:text-gray-400">
              {user?.bio || "No bio added yet"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5 dark:border-[#2a2a2a]">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <Activity size={18} />
              <span className="font-medium">Status</span>
            </div>

            <p className="mt-3 text-slate-600 dark:text-gray-400">
              {user?.status || "No status"}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 p-5 dark:border-[#2a2a2a]">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <Bell size={18} />
            <span className="font-medium">Notifications</span>
          </div>

          <p className="mt-3 text-slate-600 dark:text-gray-400">
            {user?.notificationsEnabled ? "Enabled" : "Disabled"}
          </p>
        </div>
      </div>
    </div>
  );

  if (modal) {
    return profileContent;
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] dark:bg-[#0f0f0f]">
      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Navbar
            title="My Profile"
            subtitle="View your account information"
          />

          <div className="mt-6">{profileContent}</div>
        </main>
      </div>
    </div>
  );
};

export default Profile;