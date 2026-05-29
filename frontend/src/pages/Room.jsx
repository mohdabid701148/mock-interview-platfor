import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Users,
  Globe,
  Hash,
  LogOut,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import ParticipantList from "../components/rooms/ParticipantList";
import { roomService } from "../services/room.service";

const Room = () => {
  const { roomCode } = useParams();

  const navigate = useNavigate();

  const [room, setRoom] = useState(null);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const loadRoom = async () => {
    try {
      setLoading(true);

      const res = await roomService.getRoom(roomCode);

      setRoom(res?.data || res);

    } catch (error) {

      setMessage(
        error?.response?.data?.message ||
          "Failed to load room"
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoom();
  }, [roomCode]);

  const handleLeave = async () => {
    try {

      await roomService.leaveRoom(room?._id);

      navigate("/rooms");

    } catch (error) {

      setMessage(
        error?.response?.data?.message ||
          "Failed to leave room"
      );
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
        <div className="flex">

          <Sidebar />

          <main className="flex-1 px-6 py-6 lg:px-8">

            <Navbar
              title="Room"
              subtitle="Loading room details"
            />

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
              Loading room...
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================
  // ROOM NOT FOUND
  // =========================

  if (!room) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
        <div className="flex">

          <Sidebar />

          <main className="flex-1 px-6 py-6 lg:px-8">

            <Navbar
              title="Room"
              subtitle="Room details"
            />

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
              {message || "Room not found"}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">

      <div className="flex">

        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN */}
        <main className="flex-1 px-6 py-6 lg:px-8">

          {/* NAVBAR */}
          <Navbar
            title="Room Details"
            subtitle="Manage room and participants"
          />

          {/* ERROR */}
          {message && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </div>
          )}

          {/* HERO */}
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

            {/* TOP */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

              {/* LEFT */}
              <div>

                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium capitalize text-emerald-700">
                  <CheckCircle2 size={15} />
                  {room.status || "active"}
                </span>

                <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900">
                  {room.title}
                </h1>

                <div className="mt-4 flex items-center gap-2 text-slate-500">
                  <Hash size={18} />

                  <span className="text-sm">
                    Room Code:
                  </span>

                  <span className="font-semibold text-slate-800">
                    {room.roomCode}
                  </span>
                </div>
              </div>

              {/* RIGHT BUTTONS */}
              <div className="flex items-center gap-3">

                {/* BACK */}
                <button
                  onClick={() => navigate("/rooms")}
                  className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  <ArrowLeft size={17} />
                  Back to Rooms
                </button>

                {/* LEAVE */}
                <button
                  onClick={handleLeave}
                  className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  <LogOut size={17} />
                  Leave Room
                </button>
              </div>
            </div>

            {/* STATS */}
            <div className="mt-8 grid gap-5 md:grid-cols-3">

              {/* LANGUAGE */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">

                <div className="flex items-center gap-4">

                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <Globe
                      size={22}
                      className="text-slate-700"
                    />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Language
                    </p>

                    <h3 className="mt-1 text-xl font-semibold text-slate-900">
                      {room.language}
                    </h3>
                  </div>
                </div>
              </div>

              {/* MAX PARTICIPANTS */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">

                <div className="flex items-center gap-4">

                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <Users
                      size={22}
                      className="text-slate-700"
                    />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Max Participants
                    </p>

                    <h3 className="mt-1 text-xl font-semibold text-slate-900">
                      {room.maxParticipants}
                    </h3>
                  </div>
                </div>
              </div>

              {/* PARTICIPANTS */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">

                <div className="flex items-center gap-4">

                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <Users
                      size={22}
                      className="text-slate-700"
                    />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Participants
                    </p>

                    <h3 className="mt-1 text-xl font-semibold text-slate-900">
                      {room.participants?.length || 0}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* DETAILS */}
          <section className="mt-6 grid gap-6 xl:grid-cols-[380px_1fr]">

            {/* ROOM INFO */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

              <h2 className="text-2xl font-semibold text-slate-900">
                Room Details
              </h2>

              <div className="mt-8 space-y-6">

                {/* CREATED BY */}
                <div className="border-b border-slate-100 pb-5">

                  <p className="text-sm text-slate-500">
                    Created By
                  </p>

                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    {room.createdBy?.username || "Admin"}
                  </h3>
                </div>

                {/* STATUS */}
                <div className="border-b border-slate-100 pb-5">

                  <p className="text-sm text-slate-500">
                    Room Status
                  </p>

                  <h3 className="mt-2 text-lg font-semibold capitalize text-slate-900">
                    {room.status || "active"}
                  </h3>
                </div>

                {/* ROOM CODE */}
                <div className="border-b border-slate-100 pb-5">

                  <p className="text-sm text-slate-500">
                    Room Code
                  </p>

                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    {room.roomCode}
                  </h3>
                </div>

                {/* LANGUAGE */}
                <div>

                  <p className="text-sm text-slate-500">
                    Language
                  </p>

                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    {room.language}
                  </h3>
                </div>
              </div>
            </div>

            {/* PARTICIPANTS */}
            <ParticipantList
              participants={room.participants || []}
            />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Room;