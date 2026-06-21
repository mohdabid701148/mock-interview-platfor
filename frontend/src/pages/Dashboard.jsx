import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";

import { roomService } from "../services/room.service";
import { scheduleService } from "../services/schedule.service";
import { useAuth } from "../hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [message, setMessage] = useState("");

  const loadDashboardData = async () => {
    try {
      const [roomsRes, schedulesRes] = await Promise.all([
        roomService.getMyRooms(),
        scheduleService.getUpcomingInterviews(),
      ]);

      setRooms(roomsRes?.data || roomsRes || []);
      setUpcomingSchedules(schedulesRes?.data || schedulesRes || []);
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to load dashboard data"
      );
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const activeRooms = useMemo(
    () => rooms.filter((room) => room.status !== "completed"),
    [rooms]
  );

  const completedRooms = useMemo(
    () => rooms.filter((room) => room.status === "completed"),
    [rooms]
  );

  const createdRooms = useMemo(
    () =>
      rooms.filter((room) => {
        const creatorId = room.createdBy?._id || room.createdBy;
        return creatorId?.toString?.() === user?._id?.toString?.();
      }),
    [rooms, user?._id]
  );

  const nextInterview = upcomingSchedules?.[0] || null;
  const recentRooms = rooms.slice(0, 4);

  const formatDateTime = (value) => {
    if (!value) return "--";
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  };

  const stats = [
    {
      title: "Rooms Joined",
      value: rooms.length,
      subtitle: "All rooms you are part of",
      icon: Video,
    },
    {
      title: "Active Rooms",
      value: activeRooms.length,
      subtitle: "Currently in progress",
      icon: Activity,
    },
    {
      title: "Rooms Created",
      value: createdRooms.length,
      subtitle: "Created by you",
      icon: Users,
    },
    {
      title: "Upcoming Interviews",
      value: upcomingSchedules.length,
      subtitle: "Scheduled sessions",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="min-h-screen app-bg app-heading">
      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <Navbar
            title="Dashboard"
            subtitle="A clean overview of your interview workspace"
          />

          {message && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {message}
            </div>
          )}

          <section className="mt-6 app-card rounded-3xl p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 dark:bg-[#1f1f1f] dark:text-gray-300">
                  <Sparkles size={16} />
                  MockMate Platform
                </div>

                <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
                  Welcome back, {user?.username || "User"}.
                </h1>

                <p className="mt-5 text-base leading-8 app-text">
                  Track your interview progress, check upcoming sessions, and jump
                  into the rooms workspace when you need to manage a room.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate("/rooms")}
                    className="app-btn-primary flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition"
                  >
                    Open Rooms
                    <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={() => navigate("/schedule")}
                    className="app-btn-secondary flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition"
                  >
                    <CalendarDays size={18} />
                    View Schedule
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:w-[520px]">
                {stats.slice(0, 2).map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="app-panel rounded-2xl p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm app-text">{item.title}</p>
                          <h3 className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">
                            {item.value}
                          </h3>
                        </div>

                        <div className="rounded-xl bg-white p-3 text-slate-900 dark:bg-[#2a2a2a] dark:text-white">
                          <Icon size={20} />
                        </div>
                      </div>

                      <p className="mt-4 text-sm app-text">{item.subtitle}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="app-card rounded-3xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm app-text">{item.title}</p>
                      <h3 className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">
                        {item.value}
                      </h3>
                    </div>

                    <div className="rounded-xl bg-slate-100 p-3 text-slate-700 dark:bg-[#1f1f1f] dark:text-gray-300">
                      <Icon size={20} />
                    </div>
                  </div>

                  <p className="mt-4 text-sm app-text">{item.subtitle}</p>
                </div>
              );
            })}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
            <div className="space-y-6">
              <div className="app-card rounded-3xl p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                      Upcoming Interviews
                    </h2>
                    <p className="mt-1 text-sm app-text">
                      Your next scheduled mock interview
                    </p>
                  </div>

                  <CalendarDays className="text-slate-400 dark:text-gray-500" size={22} />
                </div>

                {nextInterview ? (
                  <div className="app-panel rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm app-text">Room</p>
                        <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                          {nextInterview.roomId?.title || "Untitled Room"}
                        </h3>

                        <p className="mt-3 text-sm app-text">
                          {formatDateTime(nextInterview.scheduledTime)}
                        </p>

                        <p className="mt-2 text-sm app-text">
                          @{nextInterview.interviewer?.username} →{" "}
                          @{nextInterview.interviewee?.username}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-100 p-3 text-slate-700 dark:bg-[#2a2a2a] dark:text-gray-300">
                        <Clock3 size={20} />
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("/schedule")}
                      className="mt-5 app-btn-secondary flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition"
                    >
                      Open Schedule
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm app-text dark:border-[#2a2a2a] dark:bg-[#1f1f1f]">
                    No upcoming interviews scheduled yet.
                  </div>
                )}
              </div>

              <div className="app-card rounded-3xl p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                      Room Snapshot
                    </h2>
                    <p className="mt-1 text-sm app-text">
                      A quick overview of your latest rooms
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/rooms")}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-[#2a2a2a] dark:bg-[#1f1f1f] dark:text-gray-300 dark:hover:bg-[#262626]"
                  >
                    View all
                  </button>
                </div>

                {recentRooms.length === 0 ? (
                  <div className="flex h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 dark:border-[#2a2a2a] dark:bg-[#1f1f1f]">
                    <Video size={44} className="text-slate-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                      No rooms yet
                    </h3>
                    <p className="mt-2 text-sm app-text">
                      Open the Rooms workspace to create or join your first room.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentRooms.map((room) => (
                      <div
                        key={room._id}
                        className="app-panel flex items-center justify-between rounded-2xl px-4 py-4"
                      >
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-white">
                            {room.title || "Untitled Room"}
                          </h3>
                          <p className="mt-1 text-sm app-text">
                            {room.status === "completed" ? "Completed" : "Active"}
                          </p>
                        </div>

                        <button
                          onClick={() => navigate(`/rooms/${room.roomCode}`)}
                          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:bg-[#2a2a2a] dark:text-white dark:hover:bg-[#343434]"
                        >
                          Open
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="app-card rounded-3xl p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Quick Actions
                </h2>

                <div className="mt-5 space-y-3">
                  <button
                    onClick={() => navigate("/rooms")}
                    className="app-btn-primary flex w-full items-center justify-between rounded-2xl px-5 py-4 text-sm font-semibold transition"
                  >
                    Open Rooms Workspace
                    <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={() => navigate("/schedule")}
                    className="app-btn-secondary flex w-full items-center justify-between rounded-2xl px-5 py-4 text-sm font-semibold transition"
                  >
                    Manage Interviews
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              <div className="app-card rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Room Health
                </h2>

                <div className="mt-5 space-y-4">
                  <div className="app-panel rounded-2xl px-4 py-4">
                    <p className="text-sm app-text">Active Rooms</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      {activeRooms.length}
                    </h3>
                  </div>

                  <div className="app-panel rounded-2xl px-4 py-4">
                    <p className="text-sm app-text">Completed Rooms</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      {completedRooms.length}
                    </h3>
                  </div>

                  <div className="app-panel rounded-2xl px-4 py-4">
                    <p className="text-sm app-text">Upcoming Interviews</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      {upcomingSchedules.length}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;