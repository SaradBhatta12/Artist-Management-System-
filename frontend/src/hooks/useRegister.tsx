import { useState } from "react";
import axios from "axios";

const useRegister = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const register = async (registerData: any) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URI || "http://localhost:3000"}/api/user/register`,
        registerData
      );

      if (res.data.success) {
        setSuccess(true);
        return true;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { register, error, loading, success };
};

export default useRegister;
