import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const useLogin = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const login = async (loginData: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URI || "http://localhost:3000"}/api/user/login`,
        loginData,
        { withCredentials: true }
      );
      
      if (res.data.success) {
        setUser(res.data.user);
        // Navigate to dashboard or home after successful login
        navigate("/dashboard");
        return true;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, error, loading };
};

export default useLogin;