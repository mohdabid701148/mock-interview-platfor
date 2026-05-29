import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

const Signup = () => {

  const { register } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
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

      await register(form);

      navigate("/login");

    } catch (err) {

      setError(
        err?.response?.data?.message ||
        "Signup failed"
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-slate-950">

      {/* LEFT SIDE */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex">

        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop"
          alt="Students"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]" />

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
              Improve your interview confidence.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              Join MockMate to create mock interview rooms,
              practice with peers, and prepare for technical
              and communication interviews together.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-5">

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                
                <h3 className="text-3xl font-bold">
                  Collaboration
                </h3>

                <p className="mt-2 text-sm text-slate-300">
                  Practice interviews with peers
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                
                <h3 className="text-3xl font-bold">
                  Rooms
                </h3>

                <p className="mt-2 text-sm text-slate-300">
                  Create and join interview sessions
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
                Create Account
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Start your interview preparation journey
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

              {/* USERNAME */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Username
                </label>

                <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-slate-400 focus-within:bg-white">
                  
                  <User
                    size={18}
                    className="text-slate-400"
                  />

                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    placeholder="Enter username"
                    className="w-full bg-transparent px-3 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

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
                    placeholder="Enter email"
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
                    placeholder="Create password"
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
                {loading
                  ? "Creating account..."
                  : "Create Account"}

                {!loading && (
                  <ArrowRight size={18} />
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{" "}

              <Link
                to="/login"
                className="font-semibold text-slate-900 hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;