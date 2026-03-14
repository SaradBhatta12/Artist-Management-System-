import { useState, useCallback } from "react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URI || "http://localhost:3000";

export interface UserData {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  gender?: string;
  dob?: string;
  address?: string;
  password?: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/all-users`, {
        params: { page, search, limit: 10 },
        withCredentials: true,
      });
      if (response.data.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.total);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  const addUser = async (userData: UserData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/user/add-user`,
        userData,
        {
          withCredentials: true,
        },
      );
      if (response.data.success) {
        return { success: true, user: response.data.user };
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add user");
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUserInfo = async (id: string, userData: UserData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/user/update-user/${id}`,
        userData,
        {
          withCredentials: true,
        },
      );
      if (response.data.success) {
        return { success: true, user: response.data.user };
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user");
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/user/delete-user/${id}`,
        {
          withCredentials: true,
        },
      );
      if (response.data.success) {
        return { success: true };
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete user");
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    totalPages,
    fetchUsers,
    addUser,
    updateUserInfo,
    removeUser,
  };
};
