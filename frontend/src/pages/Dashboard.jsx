import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Video,
  Users,
  Activity,
  Sparkles,
  CheckCircle2,
  Clock3,
  Plus,
} from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import StatsCard from "../components/dashboard/StatsCard";
import CreateRoomForm from "../components/rooms/CreateRoomForm";
import JoinRoomForm from "../components/rooms/JoinRoomForm";
import RoomCard from "../components/rooms/RoomCard";

import { roomService } from "../services/room.service";
import { useAuth } from "../hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const createRoomRef = useRef(null);

  const loadRooms = async () => {
    try {
      const res = await roomService.getMyRooms();

      setRooms(res?.data || res || []);

    } catch (error) {

      setMessage(
        error?.response?.data?.message ||
          "Failed to load rooms"
      );
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleCreateRoom = async (form) => {
    try {
      setLoading(true);
      setMessage("");

      const res = await roomService.createRoom(form);

      const room = res?.data || res;

      navigate(`/rooms/${room.roomCode}`);

    } catch (error) {

      setMessage(
        error?.response?.data?.message ||
          "Failed to create room"
      );

    } finally {

      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomCode) => {
    try {
      setLoading(true);
      setMessage("");

      const res = await roomService.joinRoom(roomCode);

      const room = res?.data || res;

      navigate(`/rooms/${room.roomCode}`);

    } catch (error) {

      setMessage(
        error?.response?.data?.message ||
          "Failed to join room"
      );

    } finally {

      setLoading(false);
    }
  };

  // ===============================
  // STATS
  // ===============================

  const activeRooms = rooms.filter(
    (room) => room.status !== "completed"
  );

  const completedRooms = rooms.filter(
    (room) => room.status === "completed"
  );

  const createdRooms = rooms.filter((room) => {

    const creatorId =
      room.createdBy?._id ||
      room.createdBy;

    return (
      creatorId?.toString?.() ===
      user?._id?.toString?.()
    );
  });

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">

      <div className="flex">

        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN */}
        <main className="flex-1 px-6 py-6 lg:px-8">

          {/* NAVBAR */}
          <Navbar
            title="Dashboard"
            subtitle="Manage your mock interview rooms"
            onCreateRoom={() =>
              createRoomRef.current?.scrollIntoView({
                behavior: "smooth",
              })
            }
          />

          {/* ERROR */}
          {message && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </div>
          )}

          {/* HERO SECTION */}
          <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">

            <div className="flex flex-col gap-10 px-8 py-10 lg:flex-row lg:items-center lg:justify-between">

              {/* LEFT */}
              <div className="max-w-2xl">

                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  <Sparkles size={16} />
                  MockMate Platform
                </div>

                <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900">
                  Practice peer-to-peer mock interviews.
                </h1>

                <p className="mt-5 text-base leading-8 text-slate-500">
                  Create interview rooms, collaborate with peers,
                  and improve your technical and communication
                  interview skills in a professional mock interview
                  environment.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">

                  <button
                    onClick={() =>
                      createRoomRef.current?.scrollIntoView({
                        behavior: "smooth",
                      })
                    }
                    className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Plus size={18} />
                    Create Room
                  </button>

                  <button
                    onClick={() => navigate("/rooms")}
                    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Explore Rooms
                  </button>
                </div>
              </div>

              {/* RIGHT STATS */}
              <div className="grid gap-4 sm:grid-cols-3 lg:w-[650px]">

                <StatsCard
                  title="Rooms Joined"
                  value={rooms.length}
                  subtitle="Rooms you joined"
                  icon={Video}
                />

                <StatsCard
                  title="Active Rooms"
                  value={activeRooms.length}
                  subtitle="Currently active"
                  icon={Activity}
                />

                <StatsCard
                  title="Rooms Created"
                  value={createdRooms.length}
                  subtitle="Created by you"
                  icon={Users}
                />
              </div>
            </div>

            {/* QUICK FEATURES */}
            <div className="grid gap-4 border-t border-slate-100 bg-slate-50 px-8 py-6 md:grid-cols-3">

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                    <CheckCircle2 size={20} />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Collaboration
                    </p>

                    <h3 className="mt-1 font-semibold text-slate-900">
                      Peer Interview Practice
                    </h3>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                    <Clock3 size={20} />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Real-Time
                    </p>

                    <h3 className="mt-1 font-semibold text-slate-900">
                      Instant Room Joining
                    </h3>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
                    <Users size={20} />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Environment
                    </p>

                    <h3 className="mt-1 font-semibold text-slate-900">
                      Interview Ready
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MAIN CONTENT */}
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_420px]">

            {/* LEFT */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center justify-between">

                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Interview Rooms
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your recent and active rooms
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  {rooms.length} Rooms
                </div>
              </div>

              {rooms.length === 0 ? (

                <div className="flex h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50">

                  <Video
                    size={50}
                    className="text-slate-300"
                  />

                  <h3 className="mt-5 text-xl font-semibold text-slate-900">
                    No Rooms Yet
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Create your first mock interview room
                  </p>

                  <button
                    onClick={() =>
                      createRoomRef.current?.scrollIntoView({
                        behavior: "smooth",
                      })
                    }
                    className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Create Room
                  </button>
                </div>

              ) : (

                <div className="space-y-4">

                  {rooms.map((room) => (
                    <RoomCard
                      key={room._id}
                      room={room}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="space-y-6">

              {/* CREATE ROOM */}
              <div
                ref={createRoomRef}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >

                <div className="mb-5">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Create Room
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Start a new mock interview session
                  </p>
                </div>

                <CreateRoomForm
                  onCreate={handleCreateRoom}
                  loading={loading}
                />
              </div>

              {/* JOIN ROOM */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-5">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Join Room
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter a room code to join
                  </p>
                </div>

                <JoinRoomForm
                  onJoin={handleJoinRoom}
                  loading={loading}
                />
              </div>

              {/* EXTRA STATS */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                <h2 className="text-xl font-semibold text-slate-900">
                  Room Insights
                </h2>

                <div className="mt-5 space-y-4">

                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                    <div>
                      <p className="text-sm text-slate-500">
                        Active Rooms
                      </p>

                      <h3 className="mt-1 text-lg font-semibold text-slate-900">
                        {activeRooms.length}
                      </h3>
                    </div>

                    <Activity
                      size={22}
                      className="text-slate-400"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                    <div>
                      <p className="text-sm text-slate-500">
                        Completed Rooms
                      </p>

                      <h3 className="mt-1 text-lg font-semibold text-slate-900">
                        {completedRooms.length}
                      </h3>
                    </div>

                    <CheckCircle2
                      size={22}
                      className="text-slate-400"
                    />
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