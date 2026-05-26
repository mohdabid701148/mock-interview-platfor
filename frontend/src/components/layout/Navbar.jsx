import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl text-black">
          ChatApp
        </Link>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link to="/login" className="font-medium text-gray-700 hover:text-black">
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-black text-white font-medium"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="font-medium text-gray-700 hover:text-black">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-500 text-white font-medium"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;