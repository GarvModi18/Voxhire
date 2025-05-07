import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Lottie from "lottie-react";
import loginAnimation from "../icons/LoginAnimation.json";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );
      console.log("User Role:", response.data.user.role); // Debug log
      // Save user data & token in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-sec delay

      if (response.data.user.role == "Admin") {
        navigate("/admin-dash");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 relative">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
            <Lottie
              animationData={loginAnimation}
              loop={true}
              style={{ width: 300, height: 300 }}
              initialSegment={[0, 45]}
            />
            <p className="mt-4 text-lg font-semibold text-gray-700">
              Logging in...
            </p>
          </div>
        </div>
      )}
      <div className="bg-white p-8 w-96 rounded-lg shadow-lg text-center">
        <h2 className="text-3xl font-bold text-primary mb-6">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="p-3 mb-4 border border-primary rounded-lg text-lg"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="p-3 mb-4 border border-primary rounded-lg text-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white py-3 rounded-lg text-lg font-semibold hover:bg-secondary transition"
          >
            Login
          </button>
        </form>

        {/* Sign-up Section */}
        <p className="mt-4 text-gray-600">
          Don't have an account?{" "}
          <button
            className="text-primary font-semibold hover:text-secondary transition"
            onClick={() => navigate("/signup")}
          >
            Sign up here!
          </button>
        </p>
      </div>
    </div>
  );
}
