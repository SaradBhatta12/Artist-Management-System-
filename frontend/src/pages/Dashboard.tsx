import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";


const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log(user);
  const isArtist = user?.role === "artist";





  if (!user) {
    return <Navigate to="/login" replace />;
  }


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.first_name} {user.last_name}!</h1>
          <p className="text-gray-500 text-sm mt-1">Role: <span className="capitalize font-medium text-purple-600 border border-purple-200 bg-purple-50 px-2 py-0.5 rounded-full">{user.role}</span></p>
          <div className="mt-4 space-y-1 text-sm text-gray-700">
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        </div>
        {isArtist && (
          <Button onClick={() => navigate(`/artist/${user?.artist?.id}`)} className="flex gap-2">
            View Your Albums
          </Button>
        )}
      </div>


    </div>
  );
};

export default Dashboard;
