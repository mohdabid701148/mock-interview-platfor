import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Search, Plus, Video, Users, CheckCircle2 } from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import CreateRoomForm from "../components/rooms/CreateRoomForm";
import JoinRoomForm from "../components/rooms/JoinRoomForm";
import RoomCard from "../components/rooms/RoomCard";

import { roomService } from "../services/room.service";
import { useAuth } from "../hooks/useAuth";

const filterOptions = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "created", label: "Created by Me" },
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

const Rooms = () => {
  console.log("ROOMS PAGE RENDERED");
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
      setMessage(error?.response?.data?.message || "Failed to load rooms");
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
        setMessage("Room created, but room code was not returned");
        return;
      }

      navigate(`/rooms/${room.roomCode}`);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to create room");
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
        setMessage("Joined room, but room code was not returned");
        return;
      }

      navigate(`/rooms/${room.roomCode}`);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to join room");
    } finally {
      setActionLoading(false);
    }
  };

  const createdRooms = useMemo(() => {
    return rooms.filter((room) => {
      const creatorId = room?.createdBy?._id || room?.createdBy?.id || room?.createdBy;
      return creatorId?.toString() === currentUserId?.toString();
    });
  }, [rooms, currentUserId]);

  const activeRooms = useMemo(() => {
    return rooms.filter((room) => room?.status !== "completed");
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rooms
      .filter((room) => {
        if (!query) return true;

        const title = room?.title || "";
        const roomCode = room?.roomCode || "";
        const language = room?.language || "";

        return `${title} ${roomCode} ${language}`.toLowerCase().includes(query);
      })
      .filter((room) => {
        if (activeFilter === "all") return true;
        if (activeFilter === "active") return room?.status !== "completed";
        if (activeFilter === "completed") return room?.status === "completed";

        if (activeFilter === "created") {
          const creatorId = room?.createdBy?._id || room?.createdBy?.id || room?.createdBy;
          return creatorId?.toString() === currentUserId?.toString();
        }

        return true;
      });
  }, [rooms, search, activeFilter, currentUserId]);

  return (
    <div className="min-h-screen app-bg app-heading">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 px-6 py-6 lg:px-8">
          <Navbar title="Rooms" subtitle="Manage your interview room workspace" />

          {message && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {message}
            </div>
          )}

          <section className="mt-6 app-card rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 dark:bg-[#1f1f1f] dark:text-gray-300">
                  <Video size={16} />
                  Rooms Workspace
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Create, join, search, and manage rooms.
                </h1>

                <p className="mt-2 text-sm app-text">
                  This page is the workspace for room actions. The dashboard is only for overview.
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
                className="app-btn-primary flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition"
              >
                <Plus size={18} />
                Create Room
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="app-panel rounded-2xl p-5">
                <p className="text-sm app-text">Total Rooms</p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                  {rooms.length}
                </h3>
              </div>

              <div className="app-panel rounded-2xl p-5">
                <p className="text-sm app-text">Active Rooms</p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                  {activeRooms.length}
                </h3>
              </div>

              <div className="app-panel rounded-2xl p-5">
                <p className="text-sm app-text">Created by You</p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                  {createdRooms.length}
                </h3>
              </div>
            </div>
          </section>

          <section className="mt-6 app-card rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-xl">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500"
                />

                <input
                  type="text"
                  placeholder="Search rooms by title, code, or language..."
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

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
            <div className="app-card rounded-3xl p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    Room List
                  </h2>
                  <p className="mt-1 text-sm app-text">
                    Browse and open your interview rooms
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 dark:bg-[#1f1f1f] dark:text-gray-300">
                  {filteredRooms.length} Found
                </div>
              </div>

              {pageLoading ? (
                <div className="flex h-[360px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-sm app-text dark:border-[#2a2a2a] dark:bg-[#1f1f1f]">
                  Loading rooms...
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="flex h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 dark:border-[#2a2a2a] dark:bg-[#1f1f1f]">
                  <Filter size={44} className="text-slate-300 dark:text-gray-600" />

                  <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
                    No Rooms Found
                  </h3>

                  <p className="mt-2 text-sm app-text">
                    Try a different filter or create a new room.
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
                    Create Room
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRooms.map((room) => (
                    <RoomCard key={room?._id || room?.roomCode} room={room} />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div ref={createRoomRef} className="app-card rounded-3xl p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    Create Room
                  </h2>

                  <p className="mt-1 text-sm app-text">
                    Start a new interview session
                  </p>
                </div>

                <CreateRoomForm onCreate={handleCreateRoom} loading={actionLoading} />
              </div>

              <div className="app-card rounded-3xl p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    Join Room
                  </h2>

                  <p className="mt-1 text-sm app-text">
                    Enter a room code to continue
                  </p>
                </div>

                <JoinRoomForm onJoin={handleJoinRoom} loading={actionLoading} />
              </div>

              <div className="app-card rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Room Tips
                </h2>

                <div className="mt-5 space-y-4">
                  <div className="app-panel rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-slate-100 p-3 text-slate-700 dark:bg-[#2a2a2a] dark:text-white">
                        <CheckCircle2 size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          Keep room titles clear
                        </p>

                        <p className="mt-1 text-sm app-text">
                          Use role-based names like Frontend Mock or DSA Practice.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="app-panel rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-slate-100 p-3 text-slate-700 dark:bg-[#2a2a2a] dark:text-white">
                        <Users size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          Join only with code
                        </p>

                        <p className="mt-1 text-sm app-text">
                          Use the join box when someone shares a valid room code.
                        </p>
                      </div>
                    </div>
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

export default Rooms;