import { useState, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URI || "http://localhost:3000";

export interface ArtistData {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  dob?: string;
  gender?: string;
  address?: string;
  first_release_year?: number;
  no_of_albums_released?: number;
}

export const useArtists = () => {
  const [artists, setArtists] = useState<ArtistData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchArtists = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/artist/all`, {
        params: { page, search, limit: 10 },
        withCredentials: true,
      });
      if (response.data.success) {
        setArtists(response.data.artists);
        setTotalPages(response.data.total);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch artists");
    } finally {
      setLoading(false);
    }
  }, []);

  const addArtist = async (artistData: ArtistData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/artist/create`, artistData, {
        withCredentials: true,
      });
      if (response.data.success) {
        return { success: true, artist: response.data.artist };
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add artist");
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const updateArtistInfo = async (id: string, artistData: ArtistData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/artist/update/${id}`, artistData, {
        withCredentials: true,
      });
      if (response.data.success) {
        return { success: true, artist: response.data.artist };
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update artist");
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const removeArtist = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/artist/delete/${id}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        return { success: true };
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete artist");
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    artists,
    loading,
    error,
    totalPages,
    fetchArtists,
    addArtist,
    updateArtistInfo,
    removeArtist,
  };
};
