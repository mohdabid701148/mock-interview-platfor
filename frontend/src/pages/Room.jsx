import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Users,
  Globe,
  Hash,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Code2,
} from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import ParticipantList from "../components/rooms/ParticipantList";
import { roomService } from "../services/room.service";

const getRoomFromResponse = (res) => {
  return res?.data?.room || res?.data || res?.room || res;
};

const Room = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const participants = useMemo(() => {
    return Array.isArray(room?.participants) ? room.participants : [];
  }, [room]);

  const creatorName =
    room?.createdBy?.username ||
    room?.createdBy?.name ||
    room?.createdBy?.email ||
    "Admin";

  const loadRoom = async () => {
    try {
      setLoading(true);
      setMessage("");

      let res;

      if (roomService.getRoomByCode) {
        res = await roomService.getRoomByCode(roomCode);
      } else {
        res = await roomService.getRoom(roomCode);
      }

      setRoom(getRoomFromResponse(res));
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load room");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomCode) {
      loadRoom();
    }
  }, [roomCode]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room?.roomCode || roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleLeave = async () => {
    try {
      setMessage("");

      if (roomService.leaveRoom) {
        await roomService.leaveRoom(room?._id || room?.id || roomCode);
      }

      navigate("/rooms");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to leave room");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen app-bg app-heading">
        <div className="flex">
          <Sidebar />

          <main className="flex-1 px-6 py-6 lg:px-8">
            <Navbar title="Room" subtitle="Loading room details" />

            <div className="mt-6 app-card rounded-3xl p-8 text-sm app-text shadow-sm">
              Loading room...
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen app-bg app-heading">
        <div className="flex">
          <Sidebar />

          <main className="flex-1 px-6 py-6 lg:px-8">
            <Navbar title="Room" subtitle="Room details" />

            <div className="mt-6 app-card rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Room not found
              </h2>

              <p className="mt-2 text-sm app-text">
                {message || "Unable to find this interview room."}
              </p>

              <button
                type="button"
                onClick={() => navigate("/rooms")}
                className="mt-6 app-btn-secondary inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition"
              >
                <ArrowLeft size={17} />
                Back to Rooms
              </button>
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
          <Navbar title="Room Details" subtitle="Manage room and participants" />

          {message && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {message}
            </div>
          )}

          <section className="mt-6 app-card rounded-3xl p-8 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
                    room?.status === "completed"
                      ? "bg-slate-100 text-slate-600 dark:bg-[#1f1f1f] dark:text-gray-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                  }`}
                >
                  <CheckCircle2 size={15} />
                  {room?.status || "active"}
                </span>

                <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {room?.title || "Interview Room"}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-2 app-text">
                  <Hash size={18} />

                  <span className="text-sm">Room Code:</span>

                  <span className="font-semibold text-slate-800 dark:text-gray-200">
                    {room?.roomCode || roomCode}
                  </span>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="ml-2 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-[#2a2a2a] dark:bg-[#1f1f1f] dark:text-gray-300 dark:hover:bg-[#262626]"
                  >
                    <Copy size={13} />
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/rooms")}
                  className="app-btn-secondary flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition"
                >
                  <ArrowLeft size={17} />
                  Back to Rooms
                </button>

                <button
                  type="button"
                  onClick={handleLeave}
                  className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/15"
                >
                  <LogOut size={17} />
                  Leave Room
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="app-panel rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-[#171717]">
                    <Globe size={22} className="text-slate-700 dark:text-gray-200" />
                  </div>

                  <div>
                    <p className="text-sm app-text">Language</p>

                    <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                      {room?.language || "Not selected"}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="app-panel rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-[#171717]">
                    <Users size={22} className="text-slate-700 dark:text-gray-200" />
                  </div>

                  <div>
                    <p className="text-sm app-text">Max Participants</p>

                    <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                      {room?.maxParticipants || 2}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="app-panel rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-[#171717]">
                    <Code2 size={22} className="text-slate-700 dark:text-gray-200" />
                  </div>

                  <div>
                    <p className="text-sm app-text">Participants</p>

                    <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                      {participants.length}/{room?.maxParticipants || 2}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[380px_1fr]">
            <div className="app-card rounded-3xl p-7 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Room Details
              </h2>

              <div className="mt-8 space-y-6">
                <div className="border-b border-slate-100 pb-5 dark:border-[#2a2a2a]">
                  <p className="text-sm app-text">Created By</p>

                  <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                    {creatorName}
                  </h3>
                </div>

                <div className="border-b border-slate-100 pb-5 dark:border-[#2a2a2a]">
                  <p className="text-sm app-text">Room Status</p>

                  <h3 className="mt-2 text-lg font-semibold capitalize text-slate-900 dark:text-white">
                    {room?.status || "active"}
                  </h3>
                </div>

                <div className="border-b border-slate-100 pb-5 dark:border-[#2a2a2a]">
                  <p className="text-sm app-text">Room Code</p>

                  <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                    {room?.roomCode || roomCode}
                  </h3>
                </div>

                <div>
                  <p className="text-sm app-text">Language</p>

                  <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                    {room?.language || "Not selected"}
                  </h3>
                </div>
              </div>
            </div>

            <ParticipantList participants={participants} />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Room;