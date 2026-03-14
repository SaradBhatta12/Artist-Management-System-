import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { useArtists } from "../hooks/useArtists";
import type { ArtistData } from "../hooks/useArtists";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Artist = () => {
  const { user } = useAuth();
  const location = useLocation();
  const pathname = location?.pathname;

  if (user?.role === "artist" && pathname === "/artist") {
    return <Navigate to="/dashboard" replace />;
  }

  const {
    artists,
    loading,
    totalPages,
    fetchArtists,
    addArtist,
    updateArtistInfo,
    removeArtist,
    error,
  } = useArtists();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<ArtistData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<ArtistData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    dob: "",
    gender: "male",
    address: "",
    first_release_year: new Date().getFullYear(),
    no_of_albums_released: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchArtists(currentPage, searchQuery);
  }, [currentPage, searchQuery, fetchArtists]);

  const handleCreate = () => {
    setEditingArtist(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      dob: "",
      gender: "male",
      address: "",
      first_release_year: new Date().getFullYear(),
      no_of_albums_released: 0,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (artist: ArtistData) => {
    setEditingArtist(artist);
    setFormData({
      ...artist,
      email: artist.email || "",
      phone: artist.phone || "",
      password: "", // Password shouldn't be populated on edit for security
      dob: artist.dob ? new Date(artist.dob).toISOString().split("T")[0] : "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this artist?")) {
      const result = await removeArtist(id);
      if (result?.success) {
        fetchArtists(currentPage, searchQuery);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let result;
    if (editingArtist?.id) {
      result = await updateArtistInfo(editingArtist.id, formData);
    } else {
      result = await addArtist(formData);
    }

    if (result?.success) {
      setIsModalOpen(false);
      fetchArtists(currentPage, searchQuery);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "first_release_year" || name === "no_of_albums_released"
          ? Number(value)
          : value,
    }));
  };

  const handleExport = () => {
    alert("Exporting artists to CSV...");
  };

  const handleImport = () => {
    alert("Triggering CSV import...");
  };

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-6 rounded-xl shadow-sm gap-4 border border-gray-100'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Artist Management
          </h1>
          <p className='text-gray-500 text-sm'>
            Manage artist profiles, albums, and CSV data.
          </p>
        </div>
        <div className='flex flex-wrap gap-2 w-full lg:w-auto'>
          <input
            type='text'
            placeholder='Search artists...'
            className='border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none'
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Button
            variant='secondary'
            onClick={handleImport}
            className='flex gap-2 flex-1 sm:flex-none'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12'
              />
            </svg>
            Import CSV
          </Button>
          <Button
            variant='secondary'
            onClick={handleExport}
            className='flex gap-2 flex-1 sm:flex-none'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
              />
            </svg>
            Export CSV
          </Button>
          <Button
            onClick={handleCreate}
            className='flex gap-2 flex-1 sm:flex-none'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 4v16m8-8H4'
              />
            </svg>
            Create Artist
          </Button>
        </div>
      </div>

      {error && (
        <div
          className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative'
          role='alert'
        >
          <span className='block sm:inline'>{error}</span>
        </div>
      )}

      <Table
        headers={[
          "Artist Name",
          "DOB",
          "Gender",
          "Address",
          "First Release",
          "Albums",
          "Actions",
        ]}
        pagination={{
          currentPage,
          totalPages: totalPages,
          onPageChange: (page) => setCurrentPage(page),
        }}
      >
        {loading ? (
          <tr>
            <td colSpan={7} className='px-6 py-10 text-center text-gray-500'>
              <div className='flex justify-center items-center gap-2'>
                <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-600'></div>
                Loading artists...
              </div>
            </td>
          </tr>
        ) : artists?.length === 0 ? (
          <tr>
            <td colSpan={7} className='px-6 py-10 text-center text-gray-500'>
              No artists found.
            </td>
          </tr>
        ) : (
          artists?.map((artist) => (
            <tr
              key={artist.id}
              className='hover:bg-gray-50 transition border-b border-gray-100 last:border-0'
            >
              <td className='px-6 py-4 font-semibold text-purple-900'>
                {artist.name}
              </td>
              <td className='px-6 py-4 text-gray-600'>
                {artist.dob ? new Date(artist.dob).toLocaleDateString() : "-"}
              </td>
              <td className='px-6 py-4 capitalize text-gray-600'>
                {artist.gender || "-"}
              </td>
              <td className='px-6 py-4 text-gray-600 truncate max-w-37.5'>
                {artist.address || "-"}
              </td>
              <td className='px-6 py-4 text-gray-600'>
                {artist.first_release_year || "-"}
              </td>
              <td className='px-6 py-4'>
                <span className='bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-200'>
                  {artist.no_of_albums_released} Albums
                </span>
              </td>
              <td className='px-6 py-4'>
                <div className='flex gap-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => navigate(`/artist/${artist.id}`)}
                    className='text-purple-700 hover:text-purple-900 hover:bg-purple-50'
                  >
                    View Songs
                  </Button>
                  <div className='h-6 w-px bg-gray-200 self-center mx-1'></div>
                  {
                    user?.role === "super_admin" && (
                      <>
                        <Button
                          variant='secondary'
                          size='sm'
                          onClick={() => handleEdit(artist)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant='danger'
                          size='sm'
                          onClick={() => handleDelete(artist.id!)}
                        >
                          Delete
                        </Button>
                      </>
                    )
                  }
                </div>
              </td>
            </tr>
          ))
        )}
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingArtist ? "Edit Artist" : "Create New Artist"}
      >
        <form className='space-y-4' onSubmit={handleSubmit}>
          <div className='space-y-1.5'>
            <label className='text-sm font-semibold text-gray-700'>
              Artist Name
            </label>
            <input
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              required
              className='w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition'
              placeholder='Artist Name'
            />
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <label className='text-sm font-semibold text-gray-700'>
                Email
              </label>
              <input
                name='email'
                type='email'
                value={formData.email}
                onChange={handleInputChange}
                required={!editingArtist}
                className='w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition'
                placeholder='artist@example.com'
              />
            </div>
            <div className='space-y-1.5'>
              <label className='text-sm font-semibold text-gray-700'>
                Phone
              </label>
              <input
                name='phone'
                type='tel'
                value={formData.phone}
                onChange={handleInputChange}
                required={!editingArtist}
                className='w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition'
                placeholder='+1234567890'
              />
            </div>
          </div>
          {!editingArtist && (
            <div className='space-y-1.5'>
              <label className='text-sm font-semibold text-gray-700'>
                Password
              </label>
              <input
                name='password'
                type='password'
                value={formData.password}
                onChange={handleInputChange}
                required
                className='w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition'
                placeholder='Strong password'
              />
            </div>
          )}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <label className='text-sm font-semibold text-gray-700'>
                Date of Birth
              </label>
              <input
                name='dob'
                type='date'
                value={formData.dob}
                onChange={handleInputChange}
                className='w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition'
              />
            </div>
            <div className='space-y-1.5'>
              <label className='text-sm font-semibold text-gray-700'>
                Gender
              </label>
              <select
                name='gender'
                value={formData.gender}
                onChange={handleInputChange}
                className='w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition bg-white'
              >
                <option value='male'>Male</option>
                <option value='female'>Female</option>
                <option value='other'>Other</option>
              </select>
            </div>
          </div>
          <div className='space-y-1.5'>
            <label className='text-sm font-semibold text-gray-700'>
              Address
            </label>
            <input
              name='address'
              value={formData.address}
              onChange={handleInputChange}
              className='w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition'
              placeholder='Artist Address'
            />
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <label className='text-sm font-semibold text-gray-700'>
                First Release Year
              </label>
              <input
                name='first_release_year'
                type='number'
                value={formData.first_release_year}
                onChange={handleInputChange}
                className='w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition'
                placeholder='2020'
              />
            </div>
            <div className='space-y-1.5'>
              <label className='text-sm font-semibold text-gray-700'>
                Number of Albums
              </label>
              <input
                name='no_of_albums_released'
                type='number'
                value={formData.no_of_albums_released}
                onChange={handleInputChange}
                className='w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition'
                placeholder='0'
              />
            </div>
          </div>
          <div className='pt-6 flex flex-col-reverse sm:flex-row gap-3 justify-end border-t mt-6'>
            <Button
              variant='secondary'
              type='button'
              onClick={() => setIsModalOpen(false)}
              className='w-full sm:w-auto'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='w-full sm:w-auto'
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : editingArtist
                  ? "Save Changes"
                  : "Create Artist"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Artist;
