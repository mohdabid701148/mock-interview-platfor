import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";

const LoginForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post(
        "/auth/login",
        formData
      );

      const accessToken =
        response.data?.data?.accessToken;

      localStorage.setItem(
        "accessToken",
        accessToken
      );

      navigate("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        onChange={handleChange}
      />

      <input
        type="password"
        name="password"
        onChange={handleChange}
      />

      <button type="submit">
        Login
      </button>
    </form>
  );
};

export default LoginForm;