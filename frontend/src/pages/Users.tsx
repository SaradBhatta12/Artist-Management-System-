import { useState, useEffect } from "react";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { useUsers } from "../hooks/useUsers";
import type { UserData } from "../hooks/useUsers";

const Users = () => {
  const { users, loading, totalPages, fetchUsers, addUser, updateUserInfo, removeUser, error } = useUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<UserData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "male",
    role: "artist",
    address: "",
    dob: "",
  });

  useEffect(() => {
    fetchUsers(currentPage, searchQuery);
  }, [currentPage, searchQuery, fetchUsers]);

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      gender: "male",
      role: "artist",
      address: "",
      dob: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      ...user,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const result = await removeUser(id);
      if (result?.success) {
        fetchUsers(currentPage, searchQuery);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let result;
    if (editingUser?._id) {
      // For updates, we might not want to send password if it's empty
      const updateData = { ...formData };
      result = await updateUserInfo(editingUser._id, updateData);
    } else {
      result = await addUser(formData);
    }

    if (result?.success) {
      setIsModalOpen(false);
      fetchUsers(currentPage, searchQuery);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow-sm gap-4 border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm">Manage system users and their roles.</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search users..."
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Button onClick={handleCreate} className="flex gap-2 whitespace-nowrap">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create User
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <Table
        headers={["Name", "Email", "Role", "Phone", "Gender", "DOB", "Actions"]}
        pagination={{
          currentPage,
          totalPages: totalPages,
          onPageChange: (page) => setCurrentPage(page),
        }}
      >
        {loading ? (
          <tr>
            <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
              <div className="flex justify-center items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-600"></div>
                Loading users...
              </div>
            </td>
          </tr>
        ) : users.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
              No users found.
            </td>
          </tr>
        ) : (
          users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50 transition border-b border-gray-100 last:border-0">
              <td className="px-6 py-4">{user.first_name} {user.last_name}</td>
              <td className="px-6 py-4 font-medium">{user.email}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                  user.role === 'artist_manager' ? 'bg-blue-100 text-blue-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                  {user.role?.replace('_', ' ') || 'user'}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-600">{user.phone || "-"}</td>
              <td className="px-6 py-4 capitalize text-gray-600">{user.gender || "-"}</td>
              <td className="px-6 py-4 capitalize text-gray-600">{user.dob ? user.dob.toString().split('T')[0] : "-"}</td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(user)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(user._id!)}>
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
        title={editingUser ? "Edit User" : "Create New User"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">First Name</label>
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                placeholder="John"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Last Name</label>
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                placeholder="Doe"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">DOB</label>
            <input

              type="date"
              value={formData?.dob}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"

            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                placeholder="98XXXXXXXX"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white"
            >
              <option value="super_admin">Super Admin</option>
              <option value="artist_manager">Artist Manager</option>
              <option value="artist">Artist</option>
            </select>
          </div>
          <div className="pt-6 flex flex-col-reverse sm:flex-row gap-3 justify-end border-t mt-6">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
              {loading ? "Processing..." : editingUser ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;