import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  Search,
  Plus,
  Video,
  Users,
  CheckCircle2,
  ClipboardList,
  UserCheck,
  ShieldCheck,
  Clock3,
} from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import CreateRoomForm from "../components/rooms/CreateRoomForm";
import JoinRoomForm from "../components/rooms/JoinRoomForm";
import RoomCard from "../components/rooms/RoomCard";

import { roomService } from "../services/room.service";
import { useAuth } from "../hooks/useAuth";

const filterOptions = [
  { key: "all", label: "All Sessions" },
  { key: "waiting", label: "Waiting" },
  { key: "active", label: "Live" },
  { key: "interviewer", label: "I Interview" },
  { key: "interviewee", label: "I Practice" },
];

const getUserId = (user) => user?._id || user?.id;

const getRoomFromResponse = (res) => {
  return res?.data?.room || res?.data || res?.room || res;
};

const getRoomsFromResponse = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.rooms)) return res.data.rooms;
  if (Array.isArray(res?.rooms)) return res.rooms;
  return [];
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value?._id || value?.id || "";
};

const isSameId = (a, b) => {
  return getId(a)?.toString() === getId(b)?.toString();
};

const hasInterviewee = (room) => {
  return Boolean(room?.interviewee);
};

const Rooms = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createRoomRef = useRef(null);

  const [rooms, setRooms] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const currentUserId = getUserId(user);

  const loadRooms = async () => {
    try {
      setPageLoading(true);
      setMessage("");

      const res = await roomService.getMyRooms();
      setRooms(getRoomsFromResponse(res));
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load sessions");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleCreateRoom = async (form) => {
    try {
      setActionLoading(true);
      setMessage("");

      const res = await roomService.createRoom(form);
      const room = getRoomFromResponse(res);

      if (!room?.roomCode) {
        setMessage("Session created, but session code was not returned");
        return;
      }

      navigate(`/rooms/${room.roomCode}`);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to create session");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinRoom = async (roomCode) => {
    try {
      setActionLoading(true);
      setMessage("");

      const res = await roomService.joinRoom(roomCode);
      const room = getRoomFromResponse(res);

      if (!room?.roomCode) {
        setMessage("Joined session, but session code was not returned");
        return;
      }

      navigate(`/rooms/${room.roomCode}`);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to join session");
    } finally {
      setActionLoading(false);
    }
  };

  const interviewerSessions = useMemo(() => {
    return rooms.filter((room) => isSameId(room?.interviewer, currentUserId));
  }, [rooms, currentUserId]);

  const intervieweeSessions = useMemo(() => {
    return rooms.filter((room) => isSameId(room?.interviewee, currentUserId));
  }, [rooms, currentUserId]);

  const liveSessions = useMemo(() => {
    return rooms.filter((room) => room?.status === "active");
  }, [rooms]);

  const waitingSessions = useMemo(() => {
    return rooms.filter((room) =>
      ["waiting", "scheduled"].includes(room?.status)
    );
  }, [rooms]);

  const readySessions = useMemo(() => {
    return rooms.filter(
      (room) =>
        ["waiting", "scheduled"].includes(room?.status) && hasInterviewee(room)
    );
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rooms
      .filter((room) => {
        if (!query) return true;

        const title = room?.title || "";
        const roomCode = room?.roomCode || "";
        const language = room?.language || "";
        const interviewer =
          room?.interviewer?.username ||
          room?.interviewer?.fullName ||
          room?.interviewer?.email ||
          "";
        const interviewee =
          room?.interviewee?.username ||
          room?.interviewee?.fullName ||
          room?.interviewee?.email ||
          "";

        return `${title} ${roomCode} ${language} ${interviewer} ${interviewee}`
          .toLowerCase()
          .includes(query);
      })
      .filter((room) => {
        if (activeFilter === "all") return true;

        if (activeFilter === "waiting") {
          return ["waiting", "scheduled"].includes(room?.status);
        }

        if (activeFilter === "active") {
          return room?.status === "active";
        }

        if (activeFilter === "interviewer") {
          return isSameId(room?.interviewer, currentUserId);
        }

        if (activeFilter === "interviewee") {
          return isSameId(room?.interviewee, currentUserId);
        }

        return true;
      });
  }, [rooms, search, activeFilter, currentUserId]);

  return (
    <div className="min-h-screen app-bg app-heading">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 px-6 py-6 lg:px-8">
          <Navbar
            title="Interview Sessions"
            subtitle="Create, join, and manage your mock interview sessions"
          />

          {message && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {message}
            </div>
          )}

          <section className="mt-6 app-card rounded-3xl p-8 shadow-sm">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  <Video size={16} />
                  Mock Interview Workspace
                </div>

                <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Run structured coding interviews with roles, live editor, and communication.
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 app-text">
                  Create a session as interviewer, invite one interviewee with a session code,
                  join a call, start the interview, and collaborate in the live editor.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  createRoomRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className="app-btn-primary flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition"
              >
                <Plus size={18} />
                Create Session
              </button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <div className="app-panel rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm app-text">Current Sessions</p>
                  <ClipboardList
                    size={18}
                    className="text-slate-500 dark:text-gray-400"
                  />
                </div>

                <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {rooms.length}
                </h3>
              </div>

              <div className="app-panel rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm app-text">Live Now</p>
                  <CheckCircle2
                    size={18}
                    className="text-emerald-600 dark:text-emerald-300"
                  />
                </div>

                <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {liveSessions.length}
                </h3>
              </div>

              <div className="app-panel rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm app-text">Waiting</p>
                  <Clock3
                    size={18}
                    className="text-amber-600 dark:text-amber-300"
                  />
                </div>

                <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {waitingSessions.length}
                </h3>
              </div>

              <div className="app-panel rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm app-text">Ready to Start</p>
                  <UserCheck
                    size={18}
                    className="text-blue-600 dark:text-blue-300"
                  />
                </div>

                <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {readySessions.length}
                </h3>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
            <div className="space-y-6">
              <section className="app-card rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative w-full lg:max-w-xl">
                    <Search
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500"
                    />

                    <input
                      type="text"
                      placeholder="Search by title, code, language, or participant..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="app-input w-full rounded-2xl py-3 pl-11 pr-4 outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map((item) => {
                      const isActive = activeFilter === item.key;

                      return (
                        <button
                          type="button"
                          key={item.key}
                          onClick={() => setActiveFilter(item.key)}
                          className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                            isActive
                              ? "bg-slate-900 text-white dark:bg-white dark:text-black"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#2a2a2a] dark:bg-[#1f1f1f] dark:text-gray-300 dark:hover:bg-[#262626]"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="app-card rounded-3xl p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                      Session List
                    </h2>

                    <p className="mt-1 text-sm app-text">
                      Active and waiting interview sessions linked to your account
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 dark:bg-[#1f1f1f] dark:text-gray-300">
                    {filteredRooms.length} Found
                  </div>
                </div>

                {pageLoading ? (
                  <div className="flex h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-sm app-text dark:border-[#2a2a2a] dark:bg-[#1f1f1f]">
                    Loading sessions...
                  </div>
                ) : filteredRooms.length === 0 ? (
                  <div className="flex h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center dark:border-[#2a2a2a] dark:bg-[#1f1f1f]">
                    <Filter
                      size={44}
                      className="text-slate-300 dark:text-gray-600"
                    />

                    <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
                      No Sessions Found
                    </h3>

                    <p className="mt-2 max-w-md text-sm app-text">
                      Create a new interview session as interviewer or join an existing session using a code.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        createRoomRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        })
                      }
                      className="mt-6 app-btn-primary rounded-2xl px-5 py-3 text-sm font-semibold transition"
                    >
                      Create Session
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRooms.map((room) => (
                      <RoomCard key={room?._id || room?.roomCode} room={room} />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-6">
              <div ref={createRoomRef} className="app-card rounded-3xl p-6 shadow-sm">
                <div className="mb-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    <ShieldCheck size={14} />
                    Interviewer Mode
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                    Create Interview Session
                  </h2>

                  <p className="mt-1 text-sm app-text">
                    You become the interviewer. The next user who joins becomes the interviewee.
                  </p>
                </div>

                <CreateRoomForm onCreate={handleCreateRoom} loading={actionLoading} />
              </div>

              <div className="app-card rounded-3xl p-6 shadow-sm">
                <div className="mb-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <UserCheck size={14} />
                    Interviewee Mode
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                    Join Interview Session
                  </h2>

                  <p className="mt-1 text-sm app-text">
                    Enter a session code shared by an interviewer.
                  </p>
                </div>

                <JoinRoomForm onJoin={handleJoinRoom} loading={actionLoading} />
              </div>

              <div className="app-card rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  How Sessions Work
                </h2>

                <div className="mt-5 space-y-4">
                  <div className="app-panel rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-blue-50 p-3 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                        <ShieldCheck size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          Creator is interviewer
                        </p>

                        <p className="mt-1 text-sm app-text">
                          The creator controls start and end actions.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="app-panel rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <UserCheck size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          Joiner is interviewee
                        </p>

                        <p className="mt-1 text-sm app-text">
                          The interviewee solves while the interviewer evaluates.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="app-panel rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-slate-100 p-3 text-slate-700 dark:bg-[#2a2a2a] dark:text-white">
                        <Video size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          Use a meeting link
                        </p>

                        <p className="mt-1 text-sm app-text">
                          Add Google Meet, Zoom, Discord, or Jitsi for communication.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="app-panel rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-slate-100 p-3 text-slate-700 dark:bg-[#2a2a2a] dark:text-white">
                        <CheckCircle2 size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          Complete interview first
                        </p>

                        <p className="mt-1 text-sm app-text">
                          Completed sessions move out of this list and will appear in History later.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Rooms;