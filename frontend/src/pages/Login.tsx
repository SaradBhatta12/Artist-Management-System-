import { useState } from "react";
import useLogin from "../hooks/useLogin";
import useRegister from "../hooks/useRegister";
import toast from "react-hot-toast";
const Login = () => {
  const [activeTab, setActiveTab] = useState("login");
  const { login, error: loginError, loading: loginLoading } = useLogin();
  const { register, error: registerError, loading: registerLoading, success: registerSuccess } = useRegister();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [isVisible, setIsVisible] = useState(false);

  const [registerData, setRegisterData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(loginData);
    if (loginError) {
      toast.error(loginError || "Login failed")
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await register(registerData);
    if (result) {
      toast.success("Registration successful! You can now login.");
      // Clear form on success
      setRegisterData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        dob: "",
        gender: "",
        address: "",
      });
      // Optionally switch to login tab after brief delay
      setTimeout(() => setActiveTab("login"), 3000);
    } else {
      toast.error(registerError || "Registration failed")
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">

        <h1 className="text-2xl font-bold text-center mb-6">
          Welcome
        </h1>

        {/* Tabs */}
        <div className="flex mb-6">
          <button
            className={`w-1/2 py-2 font-medium ${activeTab === "login"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
              }`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>

          <button
            className={`w-1/2 py-2 font-medium ${activeTab === "register"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
              }`}
            onClick={() => setActiveTab("register")}
          >
            Register
          </button>
        </div>

        {/* LOGIN FORM */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">

            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 m-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={loginData.email}
                onChange={handleLoginChange}
                className="w-full border border-gray-200 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />

            </div>
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 m-2">Password</label>
              <input
                type={isVisible ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleLoginChange}
                className="w-full border border-gray-200 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />

              <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {isVisible ? "Hide" : "Show"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className={`w-full bg-blue-500 text-white py-2 rounded font-medium transition ${loginLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-600"
                }`}
            >
              {loginLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">


            {registerSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded text-sm">
                Registration successful! You can now login.
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                value={registerData.first_name}
                onChange={handleRegisterChange}
                className="w-1/2 border border-gray-200 p-2 rounded"
              />

              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={registerData.last_name}
                onChange={handleRegisterChange}
                className="w-1/2 border border-gray-200 p-2 rounded"
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerData.email}
              onChange={handleRegisterChange}
              className="w-full border border-gray-200 p-2 rounded"
            />

            <div className="relative">
              <input
                type={isVisible ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={registerData.password}
                onChange={handleRegisterChange}
                className="w-full border border-gray-200 p-2 rounded"
              />

              <button onClick={() => setIsVisible(!isVisible)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isVisible ? "Hide" : "Show"}
              </button>
            </div>

            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={registerData.phone}
              onChange={handleRegisterChange}
              className="w-full border border-gray-200 p-2 rounded"
            />

            <input
              type="date"
              name="dob"
              value={registerData.dob}
              onChange={handleRegisterChange}
              className="w-full border border-gray-200 p-2 rounded"
            />

            <select
              name="gender"
              value={registerData.gender}
              onChange={handleRegisterChange}
              className="w-full border border-gray-200 p-2 rounded"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <textarea
              name="address"
              placeholder="Address"
              value={registerData.address}
              onChange={handleRegisterChange}
              className="w-full border border-gray-200 p-2 rounded"
            />

            <button
              type="submit"
              disabled={registerLoading}
              className={`w-full bg-green-500 text-white py-2 rounded font-medium transition ${registerLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-green-600"
                }`}
            >
              {registerLoading ? "Registering..." : "Register"}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};

export default Login;