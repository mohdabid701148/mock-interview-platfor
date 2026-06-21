import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, CheckCircle2 } from "lucide-react";
import { authService } from "../services/auth.service";
import Logo from "../components/Logo";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resend, setResend] = useState({ loading: false, msg: "" });

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await authService.verifyEmail(email.trim(), code.trim());
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Invalid or expired code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResend({ loading: true, msg: "" });
      const res = await authService.resendVerification(email.trim());
      setResend({ loading: false, msg: res?.message || "A new code has been sent." });
    } catch (err) {
      setResend({
        loading: false,
        msg: err?.response?.data?.message || "Could not resend right now.",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center">
            <Logo size={48} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">MockMate</h1>
          <p className="mt-1 text-sm text-slate-500">
            Peer to Peer Mock Interview Platform
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                <CheckCircle2 size={34} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Email verified</h2>
              <p className="mt-3 text-sm text-slate-500">
                Redirecting you to login…
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Continue to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                  <ShieldCheck size={28} className="text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Enter your code</h2>
                <p className="mt-2 text-sm text-slate-500">
                  We emailed a 6-digit verification code. It expires in 15 minutes.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-slate-400 focus-within:bg-white">
                    <Mail size={18} className="text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                      className="w-full bg-transparent px-3 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                    placeholder="------"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-slate-900 outline-none focus:border-slate-400 focus:bg-white placeholder:tracking-[0.5em] placeholder:text-slate-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-500">
                Didn’t get a code?{" "}
                <button
                  onClick={handleResend}
                  disabled={resend.loading || !email}
                  className="font-semibold text-slate-900 hover:underline disabled:opacity-60"
                >
                  {resend.loading ? "Sending..." : "Resend code"}
                </button>
                {resend.msg && (
                  <p className="mt-2 text-xs text-slate-500">{resend.msg}</p>
                )}
              </div>

              <p className="mt-4 text-center text-sm text-slate-500">
                <Link to="/login" className="font-semibold text-slate-900 hover:underline">
                  Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
