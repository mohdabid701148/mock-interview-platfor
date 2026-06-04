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
import { useSocket } from "../hooks/useSocket";
import CodeEditor from "../components/editor/CodeEditor";

const getRoomFromResponse = (res) => {
  return res?.data?.room || res?.data || res?.room || res;
};

const getStatusClasses = (status) => {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
    case "scheduled":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300";
    case "completed":
      return "bg-slate-100 text-slate-600 dark:bg-[#1f1f1f] dark:text-gray-300";
    case "cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300";
    case "waiting":
    default:
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
  }
};

const Room = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [room, setRoom] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const participants = useMemo(() => {
    return Array.isArray(room?.participants) ? room.participants : [];
  }, [room]);

  const onlineParticipants = useMemo(() => {
    return activeUsers.map((user) => ({
      _id: user.userId,
      user: {
        _id: user.userId,
        username: user.username,
        email: user.email,
      },
      username: user.username,
      email: user.email,
      role: "Member",
    }));
  }, [activeUsers]);

  const creatorName =
    room?.createdBy?.username ||
    room?.createdBy?.name ||
    room?.createdBy?.email ||
    "Admin";

  const socketRoomId = room?._id || room?.id || roomCode;
  const roomStatus = room?.status || "waiting";

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

useEffect(() => {
  if (!socket || !socketRoomId || !room) {
    return;
  }

  const handleConnect = () => {
    socket.emit("join-room", { roomId: socketRoomId });
  };

  const handleConnectError = () => {
    setMessage("Socket connection error");
  };

  const handleRoomUsers = (users) => {
    setActiveUsers(Array.isArray(users) ? users : []);
  };

  const handleSocketError = (error) => {
    setMessage(error?.message || "Socket connection error");
  };

  socket.on("connect", handleConnect);
  socket.on("connect_error", handleConnectError);
  socket.on("room-users", handleRoomUsers);
  socket.on("socket-error", handleSocketError);

  if (socket.connected) {
    socket.emit("join-room", { roomId: socketRoomId });
  } else {
    socket.connect();
  }

  return () => {
    socket.emit("leave-room", { roomId: socketRoomId });

    socket.off("connect", handleConnect);
    socket.off("connect_error", handleConnectError);
    socket.off("room-users", handleRoomUsers);
    socket.off("socket-error", handleSocketError);
  };
}, [socket, socketRoomId, room]);

  const handleStartInterview = async () => {
    try {
      setMessage("");

      const res = await roomService.startRoom(room?._id || room?.id);

      setRoom(getRoomFromResponse(res));
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to start interview");
    }
  };

  const handleCompleteInterview = async () => {
    try {
      setMessage("");

      const res = await roomService.completeRoom(room?._id || room?.id);

      setRoom(getRoomFromResponse(res));
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to complete interview"
      );
    }
  };

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

      if (socket && socketRoomId) {
        socket.emit("leave-room", { roomId: socketRoomId });
      }

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
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium capitalize ${getStatusClasses(
                    roomStatus
                  )}`}
                >
                  <CheckCircle2 size={15} />
                  {roomStatus}
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

                {roomStatus === "waiting" && (
                  <button
                    type="button"
                    onClick={handleStartInterview}
                    className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
                  >
                    Start Interview
                  </button>
                )}

                {roomStatus === "active" && (
                  <button
                    type="button"
                    onClick={handleCompleteInterview}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                    End Interview
                  </button>
                )}

                {roomStatus !== "completed" && (
                  <button
                    type="button"
                    onClick={handleLeave}
                    className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/15"
                  >
                    <LogOut size={17} />
                    Leave Room
                  </button>
                )}

                {roomStatus === "completed" && (
                  <button
                    type="button"
                    onClick={() => navigate("/rooms")}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                    Go to Rooms
                  </button>
                )}
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="app-panel rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-[#171717]">
                    <Globe
                      size={22}
                      className="text-slate-700 dark:text-gray-200"
                    />
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
                    <Users
                      size={22}
                      className="text-slate-700 dark:text-gray-200"
                    />
                  </div>

                  <div>
                    <p className="text-sm app-text">Online Now</p>

                    <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                      {activeUsers.length}/{room?.maxParticipants || 2}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="app-panel rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-[#171717]">
                    <Code2
                      size={22}
                      className="text-slate-700 dark:text-gray-200"
                    />
                  </div>

                  <div>
                    <p className="text-sm app-text">Total Participants</p>

                    <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                      {participants.length}/{room?.maxParticipants || 2}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {roomStatus === "active" && (
            <div className="mt-6">
              <CodeEditor roomId={socketRoomId} />
            </div>
          )}

          {roomStatus === "waiting" && (
            <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
              Start the interview to unlock the collaborative editor.
            </div>
          )}

          {roomStatus === "completed" && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 dark:border-[#2a2a2a] dark:bg-[#171717] dark:text-gray-400">
              This interview is completed. The editor is now locked.
            </div>
          )}

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
                    {roomStatus}
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

            <ParticipantList
              participants={
                onlineParticipants.length ? onlineParticipants : participants
              }
            />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Room;