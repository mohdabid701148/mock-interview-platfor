import { useState, useRef, useCallback, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Copy,
  CheckCircle2,
  Users,
  Hash,
} from "lucide-react";
import QuestionPanel from "../rooms/QuestionPanel";
import CodeEditor from "./CodeEditor";

// ── mini helpers ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const map = {
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    waiting: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    scheduled: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    completed: "bg-slate-500/15 text-slate-400 border-slate-500/20",
    cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] ?? map.waiting}`}>
      {status}
    </span>
  );
};

const RoleBadge = ({ role }) => (
  <span className="rounded-full border border-blue-500/20 bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-400">
    {role}
  </span>
);

const ParticipantsView = ({ participants, activeUsers }) => {
  const getId = (v) => (typeof v === "string" ? v : v?._id || v?.id || "");
  const onlineIds = new Set(activeUsers.map((u) => getId(u)));

  return (
    <div className="p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Online · {activeUsers.length}
      </p>
      {participants.length === 0 ? (
        <p className="text-xs text-slate-600">No participants yet.</p>
      ) : (
        participants.map((p) => {
          const userId = getId(p.user);
          const isOnline = onlineIds.has(userId);
          return (
            <div key={userId} className="flex items-center gap-3 rounded-xl bg-[#1f1f1f] border border-[#2a2a2a] px-3 py-2.5">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs font-bold text-slate-300">
                  {(p.user?.fullName || p.user?.username || "?")[0].toUpperCase()}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#1f1f1f] ${isOnline ? "bg-emerald-400" : "bg-slate-600"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-200">
                  {p.user?.fullName || p.user?.username || "Unknown"}
                </p>
                <p className="text-xs text-slate-500 capitalize">{p.role}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

// ── main component ──────────────────────────────────────────────────────────

const InterviewWorkspace = ({
  room,
  roomCode,
  isInterviewer,
  currentRole,
  socketRoomId,
  canStartInterview,
  canEndInterview,
  onStart,
  onComplete,
  onLeave,
  onOpenAttachModal,
  message,
  activeUsers,
  participants,
  roomStatus,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [leftWidthPct, setLeftWidthPct] = useState(42);
  const [leftTab, setLeftTab] = useState("problem");
  const [copied, setCopied] = useState(false);

  const containerRef = useRef(null);
  const isDragging = useRef(false);

  // ── drag-to-resize ────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setLeftWidthPct(Math.min(65, Math.max(22, pct)));
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // ── lock body scroll when fullscreen ─────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isFullscreen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(room?.roomCode || roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  // Extract example test cases from the attached question
  const initialTestCases = room?.attachedQuestion?.examples;

  // ── layout classes ────────────────────────────────────────────────────────
  const wrapperClass = isFullscreen
    ? "fixed inset-0 z-50 flex flex-col bg-[#0d0d0d]"
    : "flex flex-col rounded-2xl overflow-hidden border border-[#2a2a2a] bg-[#0d0d0d]";

  const bodyHeight = isFullscreen ? "calc(100vh - 44px)" : "calc(100vh - 220px)";

  return (
    <div className={wrapperClass}>
      {/* ── top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 h-11 px-3 border-b border-[#2a2a2a] bg-[#1a1a1a] shrink-0 overflow-x-auto">
        {/* Left cluster */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Hash size={12} className="text-slate-600" />
            <span className="text-slate-200 font-medium">{room?.roomCode || roomCode}</span>
            <button onClick={handleCopy} className="hover:text-slate-200 transition ml-0.5" title="Copy session code">
              {copied
                ? <CheckCircle2 size={12} className="text-emerald-400" />
                : <Copy size={12} />}
            </button>
          </div>

          <span className="text-slate-700">·</span>
          <StatusBadge status={roomStatus} />
          <RoleBadge role={currentRole} />

          {message && (
            <span className="text-xs text-red-400 max-w-52 truncate">{message}</span>
          )}
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          {canStartInterview && (
            <button
              onClick={onStart}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
            >
              Start Interview
            </button>
          )}
          {canEndInterview && (
            <button
              onClick={onComplete}
              className="rounded-lg bg-[#2a2a2a] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-[#333] transition border border-[#3a3a3a]"
            >
              End Interview
            </button>
          )}
          {!["active", "completed", "cancelled"].includes(roomStatus) && (
            <button
              onClick={onLeave}
              className="rounded-lg border border-red-500/25 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
            >
              Leave
            </button>
          )}

          <div className="w-px h-4 bg-[#2a2a2a] mx-1" />

          {/* Sidebar toggle */}
          <button
            onClick={() => setIsSidebarOpen((v) => !v)}
            className="rounded-lg border border-[#2a2a2a] p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#2a2a2a] transition"
            title={isSidebarOpen ? "Hide problem panel" : "Show problem panel"}
          >
            {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen((v) => !v)}
            className="rounded-lg border border-[#2a2a2a] p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#2a2a2a] transition"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* ── body ─────────────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex flex-1 min-h-0 overflow-hidden select-none"
        style={{ height: bodyHeight }}
      >
        {/* Left panel */}
        {isSidebarOpen && (
          <>
            <div
              className="flex flex-col overflow-hidden bg-[#1a1a1a]"
              style={{ width: `${leftWidthPct}%`, minWidth: 260, maxWidth: "65%" }}
            >
              {/* Tabs */}
              <div className="flex items-center border-b border-[#2a2a2a] bg-[#171717] px-2 shrink-0">
                {[
                  { key: "problem", label: "Problem" },
                  { key: "participants", label: `Participants (${participants.length})` },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setLeftTab(key)}
                    className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                      leftTab === key
                        ? "border-amber-500 text-amber-400"
                        : "border-transparent text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}

                {isInterviewer && leftTab === "problem" && (
                  <button
                    onClick={onOpenAttachModal}
                    className="ml-auto text-xs text-blue-400 hover:text-blue-300 transition py-2.5 px-2"
                  >
                    {room?.attachedQuestion?.title ? "Edit" : "+ Attach"}
                  </button>
                )}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {leftTab === "problem" ? (
                  <QuestionPanel
                    room={room}
                    isInterviewer={isInterviewer}
                    onOpenAttachModal={onOpenAttachModal}
                    compact
                  />
                ) : (
                  <ParticipantsView
                    participants={participants}
                    activeUsers={activeUsers}
                  />
                )}
              </div>
            </div>

            {/* Drag resizer */}
            <div
              onMouseDown={onMouseDown}
              className="w-1 shrink-0 bg-[#2a2a2a] hover:bg-blue-500/50 active:bg-blue-500 cursor-col-resize transition-colors"
              title="Drag to resize"
            />
          </>
        )}

        {/* Right panel: editor */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <CodeEditor
            roomId={socketRoomId}
            disabled={roomStatus !== "active"}
            compact
            initialTestCases={initialTestCases}
          />
        </div>
      </div>
    </div>
  );
};

export default InterviewWorkspace;
