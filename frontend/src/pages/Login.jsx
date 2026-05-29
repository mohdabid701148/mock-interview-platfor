import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await login(form);

      navigate("/dashboard");

    } catch (err) {

      setError(
        err?.response?.data?.message || "Login failed"
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-slate-950">

      {/* LEFT SIDE */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex">

        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop"
          alt="Mock Interview"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-14 text-white">
          
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold backdrop-blur-md">
                M
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  MockMate
                </h1>

                <p className="text-sm text-slate-300">
                  Peer to Peer Mock Interview Platform
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-xl">
            <h2 className="text-5xl font-bold leading-tight">
              Practice interviews with real peers.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              MockMate helps students create interview rooms,
              collaborate with peers, and improve communication
              and technical interview skills in a real interview
              environment.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-5">
              
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                <h3 className="text-3xl font-bold">
                  1K+
                </h3>

                <p className="mt-2 text-sm text-slate-300">
                  Interview Rooms Created
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                <h3 className="text-3xl font-bold">
                  Real-Time
                </h3>

                <p className="mt-2 text-sm text-slate-300">
                  Peer Collaboration Experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-1 items-center justify-center bg-[#f8fafc] px-6 py-10">

        <div className="w-full max-w-md">

          <div className="mb-8 lg:hidden">
            <h1 className="text-3xl font-bold text-slate-900">
              MockMate
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Peer to Peer Mock Interview Platform
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">

            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                Welcome Back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Login to continue your interview preparation
              </p>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address
                </label>

                <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-slate-400 focus-within:bg-white">
                  
                  <Mail
                    size={18}
                    className="text-slate-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    className="w-full bg-transparent px-3 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-slate-400 focus-within:bg-white">
                  
                  <Lock
                    size={18}
                    className="text-slate-400"
                  />

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className="w-full bg-transparent px-3 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}

                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Don’t have an account?{" "}

              <Link
                to="/signup"
                className="font-semibold text-slate-900 hover:underline"
              >
                Signup
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;