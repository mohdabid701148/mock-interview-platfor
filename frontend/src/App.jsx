import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Room from "./pages/Room";
import Schedule from "./pages/Schedule";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  const location = useLocation();

  const state = location.state;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <>
      {/* Main Routes */}
      <Routes location={backgroundLocation || location}>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/rooms"
            element={<Rooms />}
          />

          <Route
            path="/rooms/:roomCode"
            element={<Room />}
          />

          <Route
            path="/schedule"
            element={<Schedule />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>

      {/* Modal Routes */}
      {backgroundLocation && (
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route
              path="/settings"
              element={<Settings />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />
          </Route>
        </Routes>
      )}
    </>
  );
}

export default App;