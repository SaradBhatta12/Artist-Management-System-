import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { useMusic } from "../hooks/useMusic";
import type { MusicData } from "../hooks/useMusic";

const Albums = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { musics, loading, totalPages, fetchMusics, addMusic, updateMusicInfo, removeMusic, error } = useMusic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<MusicData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Partial<MusicData>>({
    title: "",
    album_name: "",
    genre: "rock",
  });

  useEffect(() => {
    if (id) {
      fetchMusics(id, currentPage);
    }
  }, [id, currentPage, fetchMusics]);

  const artistName = musics.length > 0 ? musics[0].artist?.name : "Artist";

  const handleCreate = () => {
    setEditingSong(null);
    setFormData({
      title: "",
      album_name: "",
      genre: "rock",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (song: MusicData) => {
    setEditingSong(song);
    setFormData({
      title: song.title,
      album_name: song.album_name,
      genre: song.genre,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (musicId: string) => {
    if (confirm("Are you sure you want to delete this song?")) {
      const result = await removeMusic(musicId);
      if (result?.success) {
        if (id) fetchMusics(id, currentPage);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    let result;
    if (editingSong?.id) {
      result = await updateMusicInfo(editingSong.id, formData);
    } else {
      result = await addMusic({ ...formData, artist_id: id } as MusicData);
    }

    if (result?.success) {
      setIsModalOpen(false);
      fetchMusics(id, currentPage);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow-sm gap-4 border border-gray-100">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => navigate("/artist")} className="rounded-full w-20 h-10 p-0">
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{artistName} - Songs & Albums</h1>
            <p className="text-gray-500 text-sm">Manage all albums for this artist</p>
          </div>
        </div>
        <Button onClick={handleCreate} className="flex gap-2 w-full sm:w-auto">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Song
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl text-white shadow-lg">
          <h3 className="text-purple-100 text-sm font-medium uppercase tracking-wider">Total Songs</h3>
          <p className="text-4xl font-bold mt-2">{musics.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Featured Album</h3>
          <p className="text-xl font-bold mt-2 text-gray-900 truncate">
            {musics.length > 0 ? musics[0].album_name : "N/A"}
          </p>
          <p className="text-gray-400 text-sm mt-1">Artist Release</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Latest Genre</h3>
          <p className="text-xl font-bold mt-2 text-gray-900 capitalize">
            {musics.length > 0 ? musics[0].genre : "N/A"}
          </p>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            ))}
          </div>
        </div>
      </div>

      <Table
        headers={["Song Title", "Album Name", "Genre", "Actions"]}
        pagination={{
          currentPage,
          totalPages: totalPages,
          onPageChange: (page) => setCurrentPage(page),
        }}
      >
        {loading ? (
          <tr>
            <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
              <div className="flex justify-center items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-600"></div>
                Loading music...
              </div>
            </td>
          </tr>
        ) : musics.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
              No songs found for this artist.
            </td>
          </tr>
        ) : (
          musics.map((song) => (
            <tr key={song.id} className="hover:bg-gray-50 transition border-b border-gray-100 last:border-0">
              <td className="px-6 py-4 font-semibold text-gray-900">{song.title}</td>
              <td className="px-6 py-4 text-gray-600 italic">"{song.album_name || "Single"}"</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 uppercase">
                  {song.genre}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(song)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(song.id!)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))
        )}
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSong ? "Edit Song" : "Add New Song"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Song Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
              placeholder="Enter song title"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Album Name</label>
            <input
              name="album_name"
              value={formData.album_name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
              placeholder="Enter album name"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Genre</label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition bg-white"
              >
                <option value="rock">Rock</option>
                <option value="pop">Pop</option>
                <option value="jazz">Jazz</option>
                <option value="hiphop">Hip Hop</option>
                <option value="country">Country</option>
                <option value="other">Other</option>
              </select>
            </div>
            {/* Year is not in the schema, removing from form */}
          </div>
          <div className="pt-6 flex flex-col-reverse sm:flex-row gap-3 justify-end border-t mt-6">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
              {loading ? "Processing..." : editingSong ? "Save Changes" : "Add Song"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Albums;