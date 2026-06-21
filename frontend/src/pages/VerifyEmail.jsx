import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, MailWarning } from "lucide-react";
import { authService } from "../services/auth.service";

// status: "loading" | "success" | "error"
const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const ranRef = useRef(false); // guard against React StrictMode double-invoke

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const run = async () => {
      try {
        const res = await authService.verifyEmail(token);
        setStatus("success");
        setMessage(res?.message || "Email verified successfully. You can now log in.");
      } catch (err) {
        setStatus("error");
        setMessage(
          err?.response?.data?.message ||
            "This verification link is invalid or has expired."
        );
      }
    };

    run();
  }, [token]);

  const config = {
    loading: {
      Icon: Loader2,
      iconClass: "text-indigo-500 animate-spin",
      title: "Verifying your email…",
      tone: "text-slate-500",
    },
    success: {
      Icon: CheckCircle2,
      iconClass: "text-emerald-500",
      title: "Email verified",
      tone: "text-emerald-600",
    },
    error: {
      Icon: XCircle,
      iconClass: "text-red-500",
      title: "Verification failed",
      tone: "text-red-600",
    },
  }[status];

  const { Icon } = config;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900">MockMate</h1>
          <p className="mt-1 text-sm text-slate-500">
            Peer to Peer Mock Interview Platform
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
            <Icon size={34} className={config.iconClass} />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">{config.title}</h2>
          <p className={`mt-3 text-sm ${config.tone}`}>{message}</p>

          {status === "success" && (
            <Link
              to="/login"
              className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Continue to Login
            </Link>
          )}

          {status === "error" && (
            <div className="mt-7 space-y-3">
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                <MailWarning size={16} />
                The link may have expired (links last 24 hours).
              </div>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Go to Login to resend a link
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
