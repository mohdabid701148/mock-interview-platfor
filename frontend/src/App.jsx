import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Room from "./pages/Room";
import Schedule from "./pages/Schedule";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import History from "./pages/History";

function App() {
  const location = useLocation();
  const { user, loading } = useAuth();

  const state = location.state;
  const backgroundLocation = state?.backgroundLocation;

  const isAuthenticated = Boolean(user);

  // While auth is initializing, show nothing to prevent redirect flicker
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-2xl bg-slate-900 px-6 py-4 shadow-xl">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/signup"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Signup />
            )
          }
        />

        {/* Public — must work whether or not the user is logged in */}
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:roomCode" element={<Room />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history" element={<History />} />
        </Route>

        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route
              path="/profile"
              element={
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
                  <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl">
                    <Profile modal />
                  </div>
                </div>
              }
            />

            <Route
              path="/settings"
              element={
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
                  <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl">
                    <Settings modal />
                  </div>
                </div>
              }
            />
          </Route>
        </Routes>
      )}
    </>
  );
}

export default App;