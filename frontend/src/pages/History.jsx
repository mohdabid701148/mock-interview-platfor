import { useEffect, useState, useMemo } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import { feedbackService } from "../services/feedback.service";
import { useAuth } from "../hooks/useAuth";
import PastSessionModal from "../components/history/PastSessionModal";
import {
  Calendar,
  Search,
  Filter,
  Award,
  Clock3,
  Video,
  Sparkles,
  ChevronRight,
  BookOpen,
} from "lucide-react";

const getRecommendationBadge = (rec) => {
  switch (rec) {
    case "strong_hire":
      return {
        text: "Strong Hire",
        classes: "bg-emerald-100 text-emerald-800 border-emerald-250 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
      };
    case "hire":
      return {
        text: "Hire",
        classes: "bg-blue-100 text-blue-800 border-blue-250 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
      };
    case "leaning_no_hire":
      return {
        text: "Leaning No Hire",
        classes: "bg-amber-100 text-amber-800 border-amber-250 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
      };
    case "no_hire":
      return {
        text: "No Hire",
        classes: "bg-rose-100 text-rose-800 border-rose-250 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
      };
    default:
      return {
        text: rec,
        classes: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-[#2a2a2a] dark:text-gray-300 dark:border-[#3a3a3a]",
      };
  }
};

const formatDateTime = (value) => {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const History = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // 'all' | 'interviewer' | 'interviewee'
  const [langFilter, setLangFilter] = useState("all");
  const [recFilter, setRecFilter] = useState("all");

  // Selected feedback for modal review
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await feedbackService.getMyFeedbacks();
      setFeedbacks(res?.data || res || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load interview history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((fb) => {
      const room = fb.room || {};
      const interviewerId = fb.interviewer?._id || fb.interviewer;
      const loggedInUserId = user?._id;

      // 1. Search Query filter (title or room code)
      const matchesSearch =
        room.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.roomCode?.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Role filter
      let matchesRole = true;
      if (roleFilter === "interviewer") {
        matchesRole = interviewerId?.toString() === loggedInUserId?.toString();
      } else if (roleFilter === "interviewee") {
        matchesRole = interviewerId?.toString() !== loggedInUserId?.toString();
      }

      // 3. Language filter
      const matchesLang =
        langFilter === "all" ||
        room.language?.toLowerCase() === langFilter.toLowerCase();

      // 4. Recommendation filter
      const matchesRec =
        recFilter === "all" ||
        fb.recommendation?.toLowerCase() === recFilter.toLowerCase();

      return matchesSearch && matchesRole && matchesLang && matchesRec;
    });
  }, [feedbacks, searchQuery, roleFilter, langFilter, recFilter, user?._id]);

  return (
    <div className="min-h-screen app-bg app-heading">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 px-6 py-6 lg:px-8">
          <Navbar
            title="Interview History"
            subtitle="Review detailed scorecards and code snapshots from past mock interviews"
          />

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Filter Toolbar */}
          <section className="mt-6 app-card rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search
                  size={18}
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 dark:text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Search by session title or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-sm rounded-2xl app-input focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition"
                />
              </div>

              {/* Dropdown Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter size={15} className="text-slate-400 dark:text-gray-500" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">
                    Filters:
                  </span>
                </div>

                {/* Role select */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-gray-300"
                >
                  <option value="all">All Roles</option>
                  <option value="interviewer">Interviewer</option>
                  <option value="interviewee">Interviewee</option>
                </select>

                {/* Language select */}
                <select
                  value={langFilter}
                  onChange={(e) => setLangFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-gray-300"
                >
                  <option value="all">All Languages</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>

                {/* Recommendation select */}
                <select
                  value={recFilter}
                  onChange={(e) => setRecFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-gray-300"
                >
                  <option value="all">All Decisions</option>
                  <option value="strong_hire">Strong Hire</option>
                  <option value="hire">Hire</option>
                  <option value="leaning_no_hire">Leaning No Hire</option>
                  <option value="no_hire">No Hire</option>
                </select>
              </div>
            </div>
          </section>

          {/* History List */}
          <div className="mt-6">
            {loading ? (
              <div className="app-card rounded-3xl p-16 text-center text-sm app-text">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-500 border-t-transparent dark:border-white"></div>
                <p className="mt-4 font-medium">Fetching past sessions...</p>
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="app-card flex flex-col items-center justify-center rounded-3xl p-16 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-[#1f1f1f] dark:text-gray-500">
                  <BookOpen size={28} />
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                  No interview sessions found
                </h3>
                <p className="mt-2 text-sm app-text max-w-md">
                  {feedbacks.length === 0
                    ? "You haven't participated in any completed mock interviews yet. Create or join a room and finish the session to build your history."
                    : "No interview logs match your selected filter criteria. Adjust search parameters to view matching sessions."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredFeedbacks.map((fb) => {
                  const room = fb.room || {};
                  const isInterviewer =
                    fb.interviewer?._id?.toString() === user?._id?.toString();
                  const roleLabel = isInterviewer ? "Interviewer" : "Interviewee";
                  
                  return (
                    <div
                      key={fb._id}
                      className="app-card flex flex-col justify-between rounded-3xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md border border-slate-200 dark:border-[#2a2a2a]"
                    >
                      <div>
                        {/* Upper Badges row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                isInterviewer
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300"
                                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
                              }`}
                            >
                              {roleLabel}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:bg-[#1f1f1f] dark:text-gray-400 capitalize">
                              {room.language || "javascript"}
                            </span>
                          </div>
                          
                          <span className="text-[11px] font-mono text-slate-400 dark:text-gray-500">
                            Code: {room.roomCode}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white line-clamp-1">
                          {room.title || "Mock Interview"}
                        </h3>

                        {/* Meta information details */}
                        <div className="mt-4 space-y-2 text-xs app-text">
                          <p className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400" />
                            <span>{formatDateTime(room.completedAt || room.updatedAt)}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock3 size={14} className="text-slate-400" />
                            <span>
                              Partner:{" "}
                              <span className="font-semibold text-slate-800 dark:text-gray-250">
                                @{isInterviewer ? fb.interviewee?.username : fb.interviewer?.username}
                              </span>
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Scorecard Quick Preview & Button */}
                      <div className="mt-6 border-t border-slate-100 pt-4 dark:border-[#2a2a2a]/40 flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold capitalize ${
                            getRecommendationBadge(fb.recommendation).classes
                          }`}
                        >
                          <Sparkles size={13} />
                          {getRecommendationBadge(fb.recommendation).text}
                        </span>

                        <button
                          onClick={() => setSelectedFeedback(fb)}
                          className="app-btn-secondary inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold hover:shadow transition cursor-pointer"
                        >
                          Review Session
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Interactive Review Modal */}
      {selectedFeedback && (
        <PastSessionModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default History;
