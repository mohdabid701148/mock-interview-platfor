import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugMessage, setDebugMessage] = useState("LoginForm loaded");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);
    setDebugMessage("Login request started");

    try {
      if (!formData.email || !formData.password) {
        throw new Error("Email and password are required");
      }

      await login(formData);

      setDebugMessage("Login successful");

      navigate("/dashboard");
    } catch (err) {
      console.log("LOGIN ERROR:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";

      setError(message);
      setDebugMessage("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p>{debugMessage}</p>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />

      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
      />

      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;