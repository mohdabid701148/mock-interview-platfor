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
  Video,
  UserCheck,
  ShieldCheck,
  Star,
  Award,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Clock3,
} from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import ParticipantList from "../components/rooms/ParticipantList";
import { roomService } from "../services/room.service";
import { feedbackService } from "../services/feedback.service";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../hooks/useAuth";
import AttachQuestionModal from "../components/rooms/AttachQuestionModal";
import InterviewWorkspace from "../components/editor/InterviewWorkspace";

const getRoomFromResponse = (res) => {
  return res?.data?.room || res?.data || res?.room || res;
};

// Ensure a meeting link is an absolute URL. Without a protocol the browser
// treats it as a relative path and opens a broken tab inside the app.
const normalizeUrl = (url) => {
  if (!url) return "";
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value?._id || value?.id || "";
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

const getRoleClasses = (role) => {
  switch (role) {
    case "interviewer":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300";
    case "interviewee":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-[#2a2a2a] dark:text-gray-300";
  }
};

const formatDateTime = (value) => {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const renderStarRating = (value) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={
            star <= value
              ? "fill-amber-400 text-amber-400"
              : "text-slate-200 dark:text-gray-700"
          }
        />
      ))}
    </div>
  );
};

const RatingInput = ({ label, description, value, onChange }) => {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition duration-200 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-md">
        <h4 className="font-semibold text-slate-800 dark:text-gray-200 text-sm">
          {label}
        </h4>
        <p className="text-xs text-slate-550 dark:text-gray-450">
          {description}
        </p>
      </div>
      <div className="flex gap-1.5 mt-2 sm:mt-0">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => onChange(star)}
            className="p-1 transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <Star
              size={24}
              className={
                star <= value
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-300 hover:text-amber-300 dark:text-gray-650"
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
};

const getRecommendationBadge = (rec) => {
  switch (rec) {
    case "strong_hire":
      return {
        text: "Strong Hire",
        classes: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
      };
    case "hire":
      return {
        text: "Hire",
        classes: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
      };
    case "leaning_no_hire":
      return {
        text: "Leaning No Hire",
        classes: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
      };
    case "no_hire":
      return {
        text: "No Hire",
        classes: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
      };
    default:
      return {
        text: rec,
        classes: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-[#2a2a2a] dark:text-gray-300 dark:border-[#3a3a3a]",
      };
  }
};

const Room = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [socketStatus, setSocketStatus] = useState("connecting");
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);

  // Feedback & Evaluation States
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackScores, setFeedbackScores] = useState({
    codingSkills: 0,
    problemSolving: 0,
    communication: 0,
    dsaKnowledge: 0,
    codeQuality: 0,
    debugging: 0,
    speed: 0,
    overallRating: 0,
  });
  const [technicalComments, setTechnicalComments] = useState("");
  const [behavioralComments, setBehavioralComments] = useState("");
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [recommendation, setRecommendation] = useState("hire");

  const participants = useMemo(() => {
    return Array.isArray(room?.participants) ? room.participants : [];
  }, [room]);

  const currentUserId = getId(user);
  const interviewerId = getId(room?.interviewer);
  const intervieweeId = getId(room?.interviewee);

  const isInterviewer = Boolean(currentUserId && currentUserId === interviewerId);
  const isInterviewee = Boolean(currentUserId && currentUserId === intervieweeId);

  const currentRole = isInterviewer
    ? "interviewer"
    : isInterviewee
      ? "interviewee"
      : "participant";

  const creatorName = getPersonName(room?.createdBy);
  const interviewerName = getPersonName(room?.interviewer);
  const intervieweeName = getPersonName(room?.interviewee);

  const socketRoomId = room?._id || room?.id || roomCode;
  const roomStatus = room?.status || "waiting";
  const maxParticipants = room?.maxParticipants || 2;
  const hasInterviewee = Boolean(room?.interviewee);

  const canStartInterview =
    isInterviewer && hasInterviewee && ["waiting", "scheduled"].includes(roomStatus);

  const canEndInterview = isInterviewer && roomStatus === "active";

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
      setMessage(error?.response?.data?.message || "Failed to load session");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomCode) {
      loadRoom();
    }
  }, [roomCode]);

  const loadFeedback = async () => {
    if (!socketRoomId) return;
    try {
      setFeedbackLoading(true);
      const res = await feedbackService.getFeedbackForRoom(socketRoomId);
      setFeedback(res?.data || res);
    } catch (error) {
      console.log("Feedback not submitted yet or failed to fetch.");
      setFeedback(null);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    const missing = Object.keys(feedbackScores).some(
      (key) => feedbackScores[key] === 0
    );
    if (missing) {
      setMessage("Please rate all 8 scoring dimensions before submitting.");
      return;
    }
    if (!generalFeedback.trim()) {
      setMessage("Please write a general feedback summary.");
      return;
    }
    if (!recommendation) {
      setMessage("Please choose a hiring recommendation.");
      return;
    }
    try {
      setSubmittingFeedback(true);
      setMessage("");
      const res = await feedbackService.submitFeedback({
        roomId: socketRoomId,
        scores: feedbackScores,
        comments: {
          technicalComments,
          behavioralComments,
          generalFeedback,
        },
        recommendation,
      });
      setFeedback(res?.data || res);
      setMessage("");
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to submit feedback"
      );
    } finally {
      setSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    if (roomStatus === "completed") {
      loadFeedback();
    }
  }, [roomStatus, socketRoomId]);

  const isRoomLoaded = Boolean(room);

  useEffect(() => {
    if (!socket || !socketRoomId || !isRoomLoaded) {
      return;
    }

    let reconnectTimer;

    const handleConnect = () => {
      clearTimeout(reconnectTimer);

      setSocketStatus("connected");
      setMessage("");

      socket.emit("join-room", { roomId: socketRoomId });
    };

    const handleDisconnect = () => {
      setSocketStatus("connecting");
      setActiveUsers([]);
    };

    const handleConnectError = () => {
      setSocketStatus("connecting");
      setActiveUsers([]);

      clearTimeout(reconnectTimer);

      reconnectTimer = setTimeout(() => {
        if (!socket.connected && !socket.active) {
          setSocketStatus("error");
        }
      }, 15000);
    };

    const handleRoomUsers = (users) => {
      clearTimeout(reconnectTimer);

      setSocketStatus("connected");
      setMessage("");
      setActiveUsers(Array.isArray(users) ? users : []);
    };

    const handleSocketError = (error) => {
      setMessage(error?.message || "Socket error");
    };

    const handleRoomUpdated = (data) => {
      if (data?.room) {
        setRoom(data.room);

        // If the room was just cancelled, show message and redirect
        if (data.room.status === "cancelled") {
          setMessage("This interview has been cancelled. Redirecting to sessions...");
          setTimeout(() => {
            navigate("/rooms");
          }, 4000);
        }
      } else {
        loadRoom();
      }
    };

    const handleQuestionUpdated = (data) => {
      if (data?.attachedQuestion) {
        setRoom((prev) => prev ? { ...prev, attachedQuestion: data.attachedQuestion } : prev);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("room-users", handleRoomUsers);
    socket.on("socket-error", handleSocketError);
    socket.on("room-updated", handleRoomUpdated);
    socket.on("question-updated", handleQuestionUpdated);

    const handleFeedbackSubmitted = (data) => {
      if (data?.roomId === socketRoomId) {
        loadFeedback();
      }
    };

    socket.on("feedback-submitted", handleFeedbackSubmitted);

    if (socket.connected) {
      handleConnect();
    } else {
      setSocketStatus("connecting");
      socket.connect();
    }

    return () => {
      clearTimeout(reconnectTimer);

      if (socket.connected) {
        socket.emit("leave-room", { roomId: socketRoomId });
      }

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("room-users", handleRoomUsers);
      socket.off("socket-error", handleSocketError);
      socket.off("room-updated", handleRoomUpdated);
      socket.off("question-updated", handleQuestionUpdated);
      socket.off("feedback-submitted", handleFeedbackSubmitted);
    };
  }, [socket, socketRoomId, isRoomLoaded]);

  const handleAttachQuestion = (questionData) => {
    if (socket && socketRoomId) {
      socket.emit("question-attached", { roomId: socketRoomId, questionData });
    }
  };

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
      setMessage(error?.response?.data?.message || "Failed to leave session");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen app-bg app-heading">
        <div className="flex">
          <Sidebar />

          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            <Navbar title="Interview Session" subtitle="Loading session details" />

            <div className="mt-6 app-card rounded-3xl p-8 text-sm app-text shadow-sm">
              Loading interview session...
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

          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            <Navbar title="Interview Session" subtitle="Session details" />

            <div className="mt-6 app-card rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Session not found
              </h2>

              <p className="mt-2 text-sm app-text">
                {message || "Unable to find this interview session."}
              </p>

              <button
                type="button"
                onClick={() => navigate("/rooms")}
                className="mt-6 app-btn-secondary inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition"
              >
                <ArrowLeft size={17} />
                Back to Sessions
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
          <Navbar
            title="Interview Session"
            subtitle="Code, communicate, and complete your mock interview"
          />

          {message && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {message}
            </div>
          )}

          {socketStatus === "connecting" && roomStatus === "active" && (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
              Reconnecting realtime session...
            </div>
          )}

          {socketStatus === "error" && roomStatus === "active" && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
              Realtime connection is taking longer than usual. Refresh only if live updates do not resume.
            </div>
          )}

          <section className="mt-6 app-card rounded-3xl p-8 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium capitalize ${getStatusClasses(
                      roomStatus
                    )}`}
                  >
                    <CheckCircle2 size={15} />
                    {roomStatus}
                  </span>

                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium capitalize ${getRoleClasses(
                      currentRole
                    )}`}
                  >
                    <ShieldCheck size={15} />
                    You are {currentRole}
                  </span>
                </div>

                <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {room?.title || "Mock Interview"}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-2 app-text">
                  <Hash size={18} />

                  <span className="text-sm">Session Code:</span>

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
                  Back to Sessions
                </button>

                {room?.meetingLink && (
                  <a
                    href={normalizeUrl(room.meetingLink)}
                    target="mockmate-call"
                    rel="noopener"
                    className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    <Video size={17} />
                    Join Call
                  </a>
                )}

                {canStartInterview && (
                  <button
                    type="button"
                    onClick={handleStartInterview}
                    className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
                  >
                    Start Interview
                  </button>
                )}

                {canEndInterview && (
                  <button
                    type="button"
                    onClick={handleCompleteInterview}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                    End Interview
                  </button>
                )}

                {roomStatus !== "active" && roomStatus !== "completed" && roomStatus !== "cancelled" && (
                  <button
                    type="button"
                    onClick={handleLeave}
                    className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/15"
                  >
                    <LogOut size={17} />
                    Leave Session
                  </button>
                )}

                {roomStatus === "completed" && (
                  <button
                    type="button"
                    onClick={() => navigate("/rooms")}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                    Go to Sessions
                  </button>
                )}
              </div>
            </div>

            {roomStatus === "cancelled" && (
              <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-6 py-5 dark:border-red-500/20 dark:bg-red-500/10">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                      Interview Cancelled
                    </h3>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                      This interview session has been cancelled. You will be redirected shortly.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/rooms")}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  <ArrowLeft size={17} />
                  Go to Sessions
                </button>
              </div>
            )}

            {!hasInterviewee && roomStatus === "waiting" && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                Waiting for an interviewee to join. Share the room code with your partner.
              </div>
            )}

            {hasInterviewee && isInterviewee && roomStatus === "waiting" && (
              <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                You have joined as interviewee. Wait for the interviewer to start the session.
              </div>
            )}

            {hasInterviewee && isInterviewer && roomStatus === "waiting" && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                Interviewee joined. You can start the interview when both of you are ready.
              </div>
            )}

            <div className="mt-8 grid gap-5 md:grid-cols-4">
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

                    <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      {room?.language || "javascript"}
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

                    <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      {activeUsers.length}/{maxParticipants}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="app-panel rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-[#171717]">
                    <UserCheck
                      size={22}
                      className="text-slate-700 dark:text-gray-200"
                    />
                  </div>

                  <div>
                    <p className="text-sm app-text">Participants</p>

                    <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      {participants.length}/{maxParticipants}
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
                    <p className="text-sm app-text">Editor</p>

                    <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      {roomStatus === "active" ? "Unlocked" : "Locked"}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {roomStatus === "active" && (
            <div className="mt-6">
              <InterviewWorkspace
                room={room}
                roomCode={roomCode}
                isInterviewer={isInterviewer}
                currentRole={currentRole}
                socketRoomId={socketRoomId}
                canStartInterview={canStartInterview}
                canEndInterview={canEndInterview}
                onStart={handleStartInterview}
                onComplete={handleCompleteInterview}
                onLeave={handleLeave}
                onOpenAttachModal={() => setIsAttachModalOpen(true)}
                message={message}
                activeUsers={activeUsers}
                participants={participants}
                roomStatus={roomStatus}
              />
            </div>
          )}

          {roomStatus === "waiting" && (
            <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
              The editor unlocks after the interviewer starts the interview.
            </div>
          )}

          {roomStatus === "completed" && (
            <div className="mt-6">
              {feedbackLoading ? (
                <div className="app-card rounded-3xl p-8 text-center text-sm app-text">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-500 border-t-transparent dark:border-white"></div>
                  <p className="mt-2">Loading post-interview evaluation report...</p>
                </div>
              ) : feedback ? (
                // Beautiful Scorecard View
                <div className="app-card rounded-3xl p-8 shadow-sm">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-6 dark:border-[#2a2a2a]">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-[#1f1f1f] dark:text-gray-400">
                        <Award size={14} />
                        Evaluation Scorecard
                      </div>
                      <h2 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                        Mock Interview Feedback
                      </h2>
                      <p className="text-sm app-text mt-1">
                        Completed on {formatDateTime(room?.completedAt)}
                      </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2">
                      <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-gray-500 font-bold">
                        Hiring Recommendation
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-bold capitalize ${
                          getRecommendationBadge(feedback.recommendation).classes
                        }`}
                      >
                        <Sparkles size={15} />
                        {getRecommendationBadge(feedback.recommendation).text}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-8 lg:grid-cols-12">
                    {/* Left Column: Numeric metrics grid */}
                    <div className="lg:col-span-5 space-y-4">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-gray-200">
                        Performance Breakdown
                      </h3>
                      <div className="space-y-3">
                        {[
                          { key: "codingSkills", label: "Coding Skills" },
                          { key: "problemSolving", label: "Problem Solving" },
                          { key: "communication", label: "Communication" },
                          { key: "dsaKnowledge", label: "DSA Knowledge" },
                          { key: "codeQuality", label: "Code Quality" },
                          { key: "debugging", label: "Debugging" },
                          { key: "speed", label: "Speed / Pacing" },
                          { key: "overallRating", label: "Overall Rating" },
                        ].map((dim) => (
                          <div
                            key={dim.key}
                            className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-[#1f1f1f] border border-slate-100 dark:border-[#2a2a2a]/30"
                          >
                            <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                              {dim.label}
                            </span>
                            <div className="flex items-center gap-2">
                              {renderStarRating(feedback.scores?.[dim.key])}
                              <span className="text-xs font-bold text-slate-500 dark:text-gray-400">
                                ({feedback.scores?.[dim.key]}/5)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Column: Review comments */}
                    <div className="lg:col-span-7 space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                          <MessageSquare size={18} className="text-slate-400" />
                          Overall Evaluation & Summary
                        </h3>
                        <div className="rounded-2xl bg-slate-50 p-5 dark:bg-[#1a1a1a] border border-slate-100 dark:border-[#2a2a2a]/30 text-sm leading-relaxed text-slate-700 dark:text-gray-300 whitespace-pre-line">
                          {feedback.comments?.generalFeedback}
                        </div>
                      </div>

                      {feedback.comments?.technicalComments && (
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-gray-200 mb-2 text-sm">
                            Technical Feedback
                          </h4>
                          <div className="rounded-xl bg-slate-50/50 p-4 dark:bg-[#1a1a1a]/50 text-sm leading-relaxed text-slate-600 dark:text-gray-400 whitespace-pre-line border border-slate-100/50 dark:border-[#2a2a2a]/20">
                            {feedback.comments.technicalComments}
                          </div>
                        </div>
                      )}

                      {feedback.comments?.behavioralComments && (
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-gray-200 mb-2 text-sm">
                            Behavioral & Collaboration Notes
                          </h4>
                          <div className="rounded-xl bg-slate-50/50 p-4 dark:bg-[#1a1a1a]/50 text-sm leading-relaxed text-slate-600 dark:text-gray-400 whitespace-pre-line border border-slate-100/50 dark:border-[#2a2a2a]/20">
                            {feedback.comments.behavioralComments}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : isInterviewer ? (
                // Submit Feedback Form for Interviewer
                <form
                  onSubmit={handleSubmitFeedback}
                  className="app-card rounded-3xl p-8 shadow-sm"
                >
                  <div className="border-b border-slate-100 pb-5 dark:border-[#2a2a2a]">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-[#1f1f1f] dark:text-gray-400">
                      <Sparkles size={13} className="text-amber-500 fill-amber-500" />
                      Interviewer Evaluation
                    </div>
                    <h2 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                      Evaluate Candidate Performance
                    </h2>
                    <p className="text-sm app-text mt-1">
                      Complete this report to share feedback with the interviewee.
                    </p>
                  </div>

                  <div className="mt-8 space-y-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-[#2a2a2a]">
                      1. Parameter Ratings
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        { key: "codingSkills", label: "Coding Skills", desc: "Syntax correctness, dry-running, language fluency" },
                        { key: "problemSolving", label: "Problem Solving", desc: "Logical approach, understanding constraints, optimizing" },
                        { key: "communication", label: "Communication", desc: "Explaining thought process, active listening" },
                        { key: "dsaKnowledge", label: "DSA Knowledge", desc: "Choosing correct data structures & algorithms" },
                        { key: "codeQuality", label: "Code Quality", desc: "Modular code, proper naming, spacing, comments" },
                        { key: "debugging", label: "Debugging", desc: "Identifying and resolving logic/run-time errors" },
                        { key: "speed", label: "Speed / Time Management", desc: "Pacing code development, meeting constraints" },
                        { key: "overallRating", label: "Overall Rating", desc: "Overall assessment of candidate developer skills" },
                      ].map((dim) => (
                        <RatingInput
                          key={dim.key}
                          label={dim.label}
                          description={dim.desc}
                          value={feedbackScores[dim.key]}
                          onChange={(val) =>
                            setFeedbackScores((prev) => ({ ...prev, [dim.key]: val }))
                          }
                        />
                      ))}
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-[#2a2a2a] mt-8">
                      2. Written Review & Comments
                    </h3>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300">
                          General Feedback & Summary *
                        </label>
                        <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                          Provide a summary of candidate performance, strengths, and areas for improvement.
                        </p>
                        <textarea
                          rows={4}
                          value={generalFeedback}
                          onChange={(e) => setGeneralFeedback(e.target.value)}
                          placeholder="Summarize candidate performance..."
                          className="mt-2 block w-full rounded-2xl p-4 text-sm app-input focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300">
                          Technical Comments (Optional)
                        </label>
                        <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                          Specific notes on code structure, algorithm optimizations, data structure usage, or edge cases.
                        </p>
                        <textarea
                          rows={3}
                          value={technicalComments}
                          onChange={(e) => setTechnicalComments(e.target.value)}
                          placeholder="Notes on code, complexity analysis, DSA choices..."
                          className="mt-2 block w-full rounded-2xl p-4 text-sm app-input focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300">
                          Behavioral Comments (Optional)
                        </label>
                        <p className="text-xs text-slate-500 dark:text-gray-505 mt-1">
                          Notes on candidate behavior, reaction to hints, hints requested, or soft skills.
                        </p>
                        <textarea
                          rows={3}
                          value={behavioralComments}
                          onChange={(e) => setBehavioralComments(e.target.value)}
                          placeholder="Notes on collaboration, responsiveness, confidence..."
                          className="mt-2 block w-full rounded-2xl p-4 text-sm app-input focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition duration-200"
                        />
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-[#2a2a2a] mt-8">
                      3. Hiring Decision
                    </h3>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300">
                        Recommendation *
                      </label>
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                          { value: "strong_hire", label: "Strong Hire" },
                          { value: "hire", label: "Hire" },
                          { value: "leaning_no_hire", label: "Leaning No Hire" },
                          { value: "no_hire", label: "No Hire" },
                        ].map((opt) => (
                          <label
                            key={opt.value}
                            className={`flex flex-col items-center justify-center rounded-2xl border p-4 cursor-pointer transition-all duration-200 select-none ${
                              recommendation === opt.value
                                ? "border-slate-900 dark:border-white ring-2 ring-slate-900 dark:ring-white scale-[1.02] shadow-sm font-semibold"
                                : "border-slate-200 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#1a1a1a]"
                            }`}
                          >
                            <input
                              type="radio"
                              name="recommendation"
                              value={opt.value}
                              checked={recommendation === opt.value}
                              onChange={(e) => setRecommendation(e.target.value)}
                              className="sr-only"
                            />
                            <span className="text-sm">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-[#2a2a2a] flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingFeedback}
                        className="app-btn-primary flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-semibold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {submittingFeedback ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent dark:border-white"></div>
                            Submitting feedback...
                          </>
                        ) : (
                          "Submit Candidate Report"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                // Waiting View for Interviewee
                <div className="app-card rounded-3xl p-8 text-center shadow-sm">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Clock3 size={28} />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                    Waiting for Interviewer Report
                  </h3>
                  <p className="mt-2 text-sm app-text max-w-md mx-auto">
                    Your interviewer is currently evaluating your session across core dimensions.
                    The scorecard and evaluation comments will automatically display here once submitted.
                  </p>
                  <button
                    type="button"
                    onClick={loadFeedback}
                    className="mt-6 app-btn-secondary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer"
                  >
                    Check Status
                  </button>
                </div>
              )}
            </div>
          )}

          <section className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
            <div className="app-card rounded-3xl p-7 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Session Details
              </h2>

              <div className="mt-8 space-y-6">
                <div className="border-b border-slate-100 pb-5 dark:border-[#2a2a2a]">
                  <p className="text-sm app-text">Created By</p>

                  <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                    {creatorName}
                  </h3>
                </div>

                <div className="border-b border-slate-100 pb-5 dark:border-[#2a2a2a]">
                  <p className="text-sm app-text">Interviewer</p>

                  <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                    {interviewerName}
                  </h3>
                </div>

                <div className="border-b border-slate-100 pb-5 dark:border-[#2a2a2a]">
                  <p className="text-sm app-text">Interviewee</p>

                  <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                    {intervieweeName}
                  </h3>
                </div>

                <div className="border-b border-slate-100 pb-5 dark:border-[#2a2a2a]">
                  <p className="text-sm app-text">Session Status</p>

                  <h3 className="mt-2 text-lg font-semibold capitalize text-slate-900 dark:text-white">
                    {roomStatus}
                  </h3>
                </div>

                <div>
                  <p className="text-sm app-text">Meeting Link</p>

                  {room?.meetingLink ? (
                    <a
                      href={normalizeUrl(room.meetingLink)}
                      target="mockmate-call"
                      rel="noopener"
                      className="mt-2 inline-flex text-sm font-medium text-blue-600 hover:underline dark:text-blue-300"
                    >
                      Open meeting link
                    </a>
                  ) : (
                    <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                      Not added
                    </h3>
                  )}
                </div>
              </div>
            </div>

            <ParticipantList participants={participants} />
          </section>
        </main>
      </div>

      <AttachQuestionModal
        isOpen={isAttachModalOpen}
        onClose={() => setIsAttachModalOpen(false)}
        onAttach={handleAttachQuestion}
      />
    </div>
  );
};

export default Room;