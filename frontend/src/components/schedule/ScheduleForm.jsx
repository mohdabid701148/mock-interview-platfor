import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  FileText,
  Globe,
  Link as LinkIcon,
  ShieldCheck,
  UserCheck,
  Video,
} from "lucide-react";

const getLocalDatetimeMin = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
};

const getId = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item?._id || item?.id || "";
};

const getPersonName = (person) => {
  return (
    person?.fullName ||
    person?.username ||
    person?.name ||
    person?.email ||
    "Not assigned"
  );
};

const formatSessionLabel = (room) => {
  const title = room?.title || "Untitled Session";
  const code = room?.roomCode || "N/A";
  const language = room?.language || "language";

  return `${title} (${code}) • ${language}`;
};

const ScheduleForm = ({ rooms = [], onCreate, loading = false }) => {
  const [formData, setFormData] = useState({
    room: "",
    scheduledAt: "",
    durationMinutes: 60,
    agenda: "",
  });

  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isSubmitting = loading || localLoading;

  const selectedRoom = useMemo(() => {
    return rooms.find(
      (room) => getId(room)?.toString() === formData.room
    );
  }, [rooms, formData.room]);

  const interviewerName = getPersonName(selectedRoom?.interviewer);
  const intervieweeName = getPersonName(selectedRoom?.interviewee);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "durationMinutes"
          ? Number(value)
          : value,
    }));
  };

  const validate = () => {
    if (!formData.room) {
      return "Please select an interview session";
    }

    if (!selectedRoom) {
      return "Selected session not found";
    }

    if (!selectedRoom?.interviewer) {
      return "Selected session does not have an interviewer";
    }

    if (!selectedRoom?.interviewee) {
      return "Interviewee must join before scheduling this session";
    }

    if (!formData.scheduledAt) {
      return "Please select date and time";
    }

    const scheduledDate = new Date(formData.scheduledAt);

    if (Number.isNaN(scheduledDate.getTime())) {
      return "Please select a valid date and time";
    }

    if (scheduledDate.getTime() <= Date.now()) {
      return "Cannot schedule an interview in the past";
    }

    if (![30, 45, 60, 90, 120].includes(Number(formData.durationMinutes))) {
      return "Please select a valid duration";
    }

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
      setLocalLoading(true);

      await onCreate({
        room: formData.room,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        durationMinutes: Number(formData.durationMinutes),
        agenda: formData.agenda.trim(),
      });

      setSuccess("Interview scheduled successfully");

      setFormData({
        room: "",
        scheduledAt: "",
        durationMinutes: 60,
        agenda: "",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to schedule interview"
      );
    } finally {
      setLocalLoading(false);
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

      {rooms.length === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          No ready sessions available. Create a session first and ask the interviewee to join before scheduling.
        </div>
      )}

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-gray-300">
          <Video size={15} />
          Interview Session
        </label>

        <select
          name="room"
          value={formData.room}
          onChange={handleChange}
          disabled={rooms.length === 0}
          className="app-input w-full rounded-xl px-4 py-3 outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">Select ready session</option>

          {rooms.map((room) => (
            <option key={getId(room)} value={getId(room)}>
              {formatSessionLabel(room)}
            </option>
          ))}
        </select>

        <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
          Only sessions where you are interviewer and an interviewee has already joined are shown.
        </p>
      </div>

      {selectedRoom && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-[#2a2a2a] dark:bg-[#1f1f1f]">
          <div className="mb-4 flex items-center gap-2">
            <FileText size={16} className="text-slate-500 dark:text-gray-400" />

            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Selected Session Details
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-white p-4 dark:bg-[#171717]">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide app-muted">
                <ShieldCheck size={14} />
                Interviewer
              </div>

              <p className="mt-2 truncate text-sm font-semibold text-slate-900 dark:text-white">
                {interviewerName}
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 dark:bg-[#171717]">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide app-muted">
                <UserCheck size={14} />
                Interviewee
              </div>

              <p className="mt-2 truncate text-sm font-semibold text-slate-900 dark:text-white">
                {intervieweeName}
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 dark:bg-[#171717]">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide app-muted">
                <Globe size={14} />
                Language
              </div>

              <p className="mt-2 truncate text-sm font-semibold text-slate-900 dark:text-white">
                {selectedRoom?.language || "Not selected"}
              </p>
            </div>

            <div className="rounded-xl bg-white p-4 dark:bg-[#171717]">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide app-muted">
                <LinkIcon size={14} />
                Meeting
              </div>

              <p className="mt-2 truncate text-sm font-semibold text-slate-900 dark:text-white">
                {selectedRoom?.meetingLink ? "Meeting link added" : "Not added"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-gray-300">
            <CalendarDays size={15} />
            Date & Time
          </label>

          <input
            type="datetime-local"
            name="scheduledAt"
            value={formData.scheduledAt}
            min={getLocalDatetimeMin()}
            onChange={handleChange}
            className="app-input w-full rounded-xl px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-gray-300">
            <Clock size={15} />
            Duration
          </label>

          <select
            name="durationMinutes"
            value={formData.durationMinutes}
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

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-gray-300">
          <FileText size={15} />
          Focus Area / Agenda
        </label>

        <textarea
          name="agenda"
          value={formData.agenda}
          onChange={handleChange}
          rows={4}
          maxLength={500}
          placeholder="Example: Arrays, two pointers, React hooks, API design..."
          className="app-input w-full resize-none rounded-xl px-4 py-3 outline-none"
        />

        <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
          Optional. Add what the interview should focus on.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || rooms.length === 0}
        className="app-btn-primary rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Scheduling..." : "Schedule Interview"}
      </button>
    </form>
  );
};

export default ScheduleForm;