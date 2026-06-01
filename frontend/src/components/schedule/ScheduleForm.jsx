import { useEffect, useMemo, useState } from "react";

const getLocalDatetimeMin = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
};

const getId = (item) => item?._id || item?.id;

const getUserObject = (participant) => {
  return participant?.user || participant;
};

const formatUserLabel = (user) => {
  if (!user) return "Unknown User";

  const username = user?.username || user?.name || user?.email || "user";
  const fullName = user?.fullName;

  return fullName ? `@${username} (${fullName})` : `@${username}`;
};

const ScheduleForm = ({ rooms = [], onCreate }) => {
  const [formData, setFormData] = useState({
    roomId: "",
    interviewer: "",
    interviewee: "",
    scheduledTime: "",
    duration: 60,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedRoom = useMemo(() => {
    return rooms.find((room) => getId(room)?.toString() === formData.roomId);
  }, [rooms, formData.roomId]);

  const participants = useMemo(() => {
    if (!selectedRoom) return [];

    const users = new Map();

    const addUser = (value) => {
      const user = getUserObject(value);
      const id = getId(user);

      if (!id) return;

      users.set(id.toString(), user);
    };

    addUser(selectedRoom.createdBy);

    (selectedRoom.participants || []).forEach(addUser);

    return Array.from(users.values());
  }, [selectedRoom]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      interviewer: "",
      interviewee: "",
    }));
  }, [formData.roomId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" ? Number(value) : value,
    }));
  };

  const validate = () => {
    if (!formData.roomId) return "Please select a room";

    if (!selectedRoom) return "Selected room not found";

    if (participants.length < 2) {
      return "This room needs at least 2 participants to schedule an interview";
    }

    if (!formData.interviewer || !formData.interviewee) {
      return "Please select both interviewer and interviewee";
    }

    if (formData.interviewer === formData.interviewee) {
      return "Interviewer and interviewee cannot be the same user";
    }

    if (!formData.scheduledTime) return "Please select date and time";

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      await onCreate({
        roomId: formData.roomId,
        interviewer: formData.interviewer,
        interviewee: formData.interviewee,
        scheduledTime: new Date(formData.scheduledTime).toISOString(),
        duration: Number(formData.duration),
      });

      setSuccess("Interview scheduled successfully");

      setFormData({
        roomId: "",
        interviewer: "",
        interviewee: "",
        scheduledTime: "",
        duration: 60,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to schedule interview"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          {success}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-300">
          Room
        </label>

        <select
          name="roomId"
          value={formData.roomId}
          onChange={handleChange}
          className="app-input w-full rounded-xl px-4 py-3 outline-none"
        >
          <option value="">Select a room</option>

          {rooms.map((room) => (
            <option key={getId(room)} value={getId(room)}>
              {room?.title} ({room?.roomCode})
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-300">
            Interviewer
          </label>

          <select
            name="interviewer"
            value={formData.interviewer}
            onChange={handleChange}
            disabled={!selectedRoom}
            className="app-input w-full rounded-xl px-4 py-3 outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">Select interviewer</option>

            {participants.map((user) => (
              <option key={getId(user)} value={getId(user)}>
                {formatUserLabel(user)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-300">
            Interviewee
          </label>

          <select
            name="interviewee"
            value={formData.interviewee}
            onChange={handleChange}
            disabled={!selectedRoom}
            className="app-input w-full rounded-xl px-4 py-3 outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">Select interviewee</option>

            {participants.map((user) => (
              <option key={getId(user)} value={getId(user)}>
                {formatUserLabel(user)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-300">
            Date & Time
          </label>

          <input
            type="datetime-local"
            name="scheduledTime"
            value={formData.scheduledTime}
            min={getLocalDatetimeMin()}
            onChange={handleChange}
            className="app-input w-full rounded-xl px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-300">
            Duration
          </label>

          <select
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="app-input w-full rounded-xl px-4 py-3 outline-none"
          >
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
            <option value={120}>120 minutes</option>
          </select>
        </div>
      </div>

      {selectedRoom && (
        <div className="app-panel rounded-xl px-4 py-3 text-sm app-text">
          <span className="font-medium text-slate-900 dark:text-white">
            Room participants:
          </span>{" "}
          {participants.length > 0
            ? participants
                .map((user) => `@${user?.username || user?.name || user?.email}`)
                .join(", ")
            : "No participants found"}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="app-btn-primary rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Scheduling..." : "Schedule Interview"}
      </button>
    </form>
  );
};

export default ScheduleForm;