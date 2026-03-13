import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Artist from "./pages/Artist";
import Albums from "./pages/Albums";
import Users from "./pages/Users";
import AdminLayout from "./layout/AdminLayout";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-800'></div>
      </div>
    );
  }

  if (user?.role !== "super_admin") {
    return <Navigate to='/login' replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-800'></div>
      </div>
    );
  }

  if (user?.role === "super_admin") {
    return <Navigate to='/artist' replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* public routes */}
        <Route path='/' element={<Home />} />
        <Route
          path='/login'
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* protected layout */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path='/artist' element={<Artist />} />
          <Route path='/artist/:id' element={<Albums />} />
          <Route path='/users' element={<Users />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
