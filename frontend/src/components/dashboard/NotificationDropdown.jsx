import {
  Calendar,
  XCircle,
  Award,
  CheckCircle2,
  Check,
  CheckCheck,
} from "lucide-react";

const typeConfig = {
  schedule: {
    icon: Calendar,
    bg: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  cancel: {
    icon: XCircle,
    bg: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  },
  feedback: {
    icon: Award,
    bg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  complete: {
    icon: CheckCircle2,
    bg: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  },
};

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  if (diffMs < 0) return "Just now"; // handles slight server/client clock sync offsets
  
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export const NotificationDropdown = ({
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  return (
    <div className="absolute right-0 z-[100] mt-2 w-80 md:w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-[#2a2a2a] dark:bg-[#171717]">
      {/* Dropdown Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-[#2a2a2a] bg-slate-50/50 dark:bg-[#1f1f1f]/20">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
          Notifications
        </h3>
        
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            type="button"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition cursor-pointer"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {/* Dropdown Items list */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-[#2a2a2a]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 dark:bg-[#1e1e1e] text-slate-400">
              <CheckCircle2 size={22} />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-800 dark:text-gray-300">
              You are all caught up!
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-gray-500">
              No notifications yet.
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const config = typeConfig[notification.type] || {
              icon: CheckCircle2,
              bg: "bg-slate-100 text-slate-600 dark:bg-[#1e1e1e] dark:text-gray-400",
            };
            const Icon = config.icon;

            return (
              <div
                key={notification._id}
                className={`flex gap-3 px-4 py-3.5 transition duration-150 relative ${
                  notification.isRead
                    ? "bg-white dark:bg-[#171717] hover:bg-slate-50 dark:hover:bg-[#1e1e1e]/40"
                    : "bg-blue-50/20 dark:bg-blue-500/[0.02] hover:bg-blue-50/40 dark:hover:bg-blue-500/[0.04]"
                }`}
              >
                {/* Visual Icon Badge */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
                  <Icon size={18} />
                </div>

                {/* Content info */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-baseline justify-between gap-1.5">
                    <h4 className="font-semibold text-slate-850 dark:text-gray-250 text-xs truncate">
                      {notification.title}
                    </h4>
                    
                    <span className="text-[10px] text-slate-400 dark:text-gray-550 shrink-0">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  
                  <p className="mt-1 text-[11px] text-slate-600 dark:text-gray-400 leading-normal line-clamp-2">
                    {notification.message}
                  </p>
                </div>

                {/* Rightmost status and action dot/tick */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {!notification.isRead ? (
                    <>
                      {/* Unread circle badge */}
                      <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                      
                      {/* Hover action mark-as-read check button */}
                      <button
                        onClick={() => onMarkAsRead(notification._id)}
                        title="Mark as read"
                        type="button"
                        className="group flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 opacity-0 transition hover:bg-slate-100 hover:text-slate-850 focus:opacity-100 parent-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-gray-400 dark:hover:bg-[#262626] dark:hover:text-white cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <Check size={13} />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
