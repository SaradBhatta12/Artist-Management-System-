import { useState, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URI || "http://localhost:3000";

export interface MusicData {
  _id?: string;
  artist_id: string;
  title: string;
  album_name?: string;
  genre?: string;
  artist?: {
    name: string;
    _id: string;
  };
}

export const useMusic = () => {
  const [musics, setMusics] = useState<MusicData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMusics = useCallback(async (artistId: string, page = 1) => {
    if (!artistId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/music/all`, {
        params: { id: artistId, page, limit: 10 },
        withCredentials: true,
      });
      if (response.data.success) {
        // Ensure musics is an array, as the backend fix returned the array directly
        const data = response.data.musics;
        setMusics(Array.isArray(data) ? data : []);
        setTotalPages(response.data.total);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch music");
    } finally {
      setLoading(false);
    }
  }, []);

  const addMusic = async (musicData: MusicData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/music/create`, musicData, {
        withCredentials: true,
      });
      if (response.data.success) {
        return { success: true, music: response.data.music };
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add music");
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const updateMusicInfo = async (id: string, musicData: Partial<MusicData>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/music/update/${id}`, musicData, {
        withCredentials: true,
      });
      if (response.data.success) {
        return { success: true, music: response.data.music };
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update music");
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const removeMusic = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/music/delete/${id}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        return { success: true };
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete music");
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    musics,
    loading,
    error,
    totalPages,
    fetchMusics,
    addMusic,
    updateMusicInfo,
    removeMusic,
  };
};
