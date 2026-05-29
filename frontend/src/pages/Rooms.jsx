import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Video, Search } from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import CreateRoomForm from "../components/rooms/CreateRoomForm";
import JoinRoomForm from "../components/rooms/JoinRoomForm";
import RoomCard from "../components/rooms/RoomCard";
import { roomService } from "../services/room.service";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const createRoomRef = useRef(null);

  const loadRooms = async () => {
    try {
      const res = await roomService.getMyRooms();
      setRooms(res?.data || res || []);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load rooms");
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
      setMessage(error?.response?.data?.message || "Failed to create room");
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
      setMessage(error?.response?.data?.message || "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter((room) =>
    (room?.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 px-6 py-6 lg:px-8">
          <Navbar title="Rooms" subtitle="Create, join and manage interview rooms" />

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Rooms
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  View and manage all your rooms
                </p>
              </div>

              <button
                onClick={() =>
                  createRoomRef.current?.scrollIntoView({ behavior: "smooth" })
                }
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <Plus size={18} />
                Create Room
              </button>
            </div>

            <div className="mt-6 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="mr-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </section>

          {message ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </div>
          ) : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_420px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-900">All Rooms</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your recent and active rooms
                </p>
              </div>

              {filteredRooms.length === 0 ? (
                <div className="flex h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                  <Video size={44} className="text-slate-300" />
                  <h3 className="mt-5 text-lg font-medium text-slate-900">
                    No Rooms Found
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Create a room to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRooms.map((room) => (
                    <RoomCard key={room._id} room={room} />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div
                ref={createRoomRef}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5">
                  <h2 className="text-2xl font-semibold text-slate-900">Create Room</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Start a new interview session
                  </p>
                </div>

                <CreateRoomForm onCreate={handleCreateRoom} loading={loading} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-2xl font-semibold text-slate-900">Join Room</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter room code to continue
                  </p>
                </div>

                <JoinRoomForm onJoin={handleJoinRoom} loading={loading} />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Rooms;