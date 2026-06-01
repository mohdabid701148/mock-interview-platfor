import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  RefreshCcw,
  Video,
} from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import ScheduleForm from "../components/schedule/ScheduleForm";
import UpcomingInterviews from "../components/schedule/UpcomingInterviews";
import InterviewCalendar from "../components/schedule/InterviewCalendar";

import { roomService } from "../services/room.service";
import { scheduleService } from "../services/schedule.service";

const getRoomsFromResponse = (res) => {
  const data = res?.data ?? res;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.rooms)) return data.rooms;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.rooms)) return data.data.rooms;

  return [];
};

const getSchedulesFromResponse = (res) => {
  const data = res?.data ?? res;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.schedules)) return data.schedules;
  if (Array.isArray(data?.interviews)) return data.interviews;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.schedules)) return data.data.schedules;
  if (Array.isArray(data?.data?.interviews)) return data.data.interviews;

  return [];
};

const Schedule = () => {
  const [rooms, setRooms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setError("");

      const [roomsRes, schedulesRes] = await Promise.all([
        roomService.getMyRooms(),
        scheduleService.getUpcomingInterviews(),
      ]);

      setRooms(getRoomsFromResponse(roomsRes));
      setSchedules(getSchedulesFromResponse(schedulesRes));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load schedule page data"
      );
    }
  }, []);

  const loadPage = useCallback(async () => {
    try {
      setLoading(true);
      await fetchData();
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateSchedule = async (payload) => {
    await scheduleService.createSchedule(payload);
    await fetchData();
  };

  const handleStatusChange = async (scheduleId, status) => {
    try {
      setActionLoadingId(scheduleId);
      setError("");

      await scheduleService.updateScheduleStatus(scheduleId, status);
      await fetchData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update schedule status"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const handleCancel = async (scheduleId) => {
    try {
      setActionLoadingId(scheduleId);
      setError("");

      await scheduleService.cancelSchedule(scheduleId);
      await fetchData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to cancel interview"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const stats = useMemo(() => {
    const completed = schedules.filter(
      (schedule) => schedule?.status === "completed"
    ).length;

    const upcoming = schedules.filter(
      (schedule) =>
        schedule?.status !== "completed" && schedule?.status !== "cancelled"
    ).length;

    return {
      rooms: rooms.length,
      upcoming,
      completed,
    };
  }, [rooms, schedules]);

  if (loading) {
    return (
      <div className="min-h-screen app-bg app-heading">
        <div className="flex">
          <Sidebar />

          <main className="flex-1 px-6 py-6 lg:px-8">
            <Navbar title="Schedule" subtitle="Loading your interview schedule" />

            <div className="mt-6 app-card rounded-3xl p-8 shadow-sm">
              <p className="text-sm app-text">Loading schedule data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg app-heading">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 px-6 py-6 lg:px-8">
          <Navbar
            title="Schedule"
            subtitle="Schedule mock interviews and track upcoming sessions"
          />

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          <section className="mt-6 app-card rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 dark:bg-[#1f1f1f] dark:text-gray-300">
                  <CalendarDays size={16} />
                  Scheduling System
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Plan and manage mock interviews.
                </h1>

                <p className="mt-2 text-sm app-text">
                  Create scheduled sessions, view upcoming interviews, and keep your preparation organized.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="app-btn-secondary inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw size={17} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="app-panel rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white p-3 text-slate-700 shadow-sm dark:bg-[#171717] dark:text-gray-200">
                    <Video size={18} />
                  </div>

                  <div>
                    <p className="text-sm app-text">Available Rooms</p>
                    <h3 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                      {stats.rooms}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="app-panel rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white p-3 text-slate-700 shadow-sm dark:bg-[#171717] dark:text-gray-200">
                    <Clock size={18} />
                  </div>

                  <div>
                    <p className="text-sm app-text">Upcoming</p>
                    <h3 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                      {stats.upcoming}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="app-panel rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white p-3 text-slate-700 shadow-sm dark:bg-[#171717] dark:text-gray-200">
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <p className="text-sm app-text">Completed</p>
                    <h3 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                      {stats.completed}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="app-card rounded-3xl p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    Schedule Interview
                  </h2>

                  <p className="mt-1 text-sm app-text">
                    Select a room and create a mock interview session.
                  </p>
                </div>

                <ScheduleForm rooms={rooms} onCreate={handleCreateSchedule} />
              </div>

              <div className="app-card rounded-3xl p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    Upcoming Interviews
                  </h2>

                  <p className="mt-1 text-sm app-text">
                    Track your scheduled interview sessions.
                  </p>
                </div>

                <UpcomingInterviews
                  schedules={schedules}
                  actionLoadingId={actionLoadingId}
                  onStatusChange={handleStatusChange}
                  onCancel={handleCancel}
                />
              </div>
            </div>

            <div className="app-card rounded-3xl p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Interview Calendar
                </h2>

                <p className="mt-1 text-sm app-text">
                  Calendar-style overview of scheduled sessions.
                </p>
              </div>

              <InterviewCalendar schedules={schedules} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Schedule;