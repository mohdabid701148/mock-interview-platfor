import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import { useAuth } from "../hooks/useAuth";
import {
  User,
  Mail,
  FileText,
  Activity,
  Bell,
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth();

  const initials =
    user?.username?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <Navbar
            title="My Profile"
            subtitle="View your account information"
          />

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
            {/* Cover */}
            <div className="h-40 bg-gradient-to-r from-slate-900 to-slate-700" />

            {/* Profile */}
            <div className="relative px-8 pb-8">
              <div className="-mt-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-slate-900 text-3xl font-bold text-white">
                {initials}
              </div>

              <div className="mt-4">
                <h2 className="text-3xl font-bold text-slate-900">
                  {user?.fullName || user?.username}
                </h2>

                <p className="mt-1 text-slate-500">
                  @{user?.username}
                </p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3">
                    <User size={18} />
                    <span className="font-medium">
                      Full Name
                    </span>
                  </div>

                  <p className="mt-3 text-slate-600">
                    {user?.fullName || "Not Added"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3">
                    <Mail size={18} />
                    <span className="font-medium">
                      Email
                    </span>
                  </div>

                  <p className="mt-3 text-slate-600">
                    {user?.email}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3">
                    <FileText size={18} />
                    <span className="font-medium">
                      Bio
                    </span>
                  </div>

                  <p className="mt-3 text-slate-600">
                    {user?.bio || "No bio added yet"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3">
                    <Activity size={18} />
                    <span className="font-medium">
                      Status
                    </span>
                  </div>

                  <p className="mt-3 text-slate-600">
                    {user?.status || "No status"}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <Bell size={18} />
                  <span className="font-medium">
                    Notifications
                  </span>
                </div>

                <p className="mt-3 text-slate-600">
                  {user?.notificationsEnabled
                    ? "Enabled"
                    : "Disabled"}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;