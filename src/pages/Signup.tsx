import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Lottie from "lottie-react";
import signUpAnimation from "../icons/SignUpAnimation.json";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Candidate",
  });
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Handle Input Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle Signup & OTP Request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );
      setMessage(response.data.message);
      setIsOtpSent(true);

      // Start OTP Expiry Countdown (10 minutes)
      setOtpCountdown(600);
      const timer = setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsOtpSent(false);
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        {
          email: formData.email,
          otp,
        }
      );

      setMessage(response.data.message);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-sec delay
      navigate("/");
    } catch (error: any) {
      setError(error.response?.data?.message || "Incorrect OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 relative">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
            <Lottie
              animationData={signUpAnimation}
              loop={true}
              style={{ width: 300, height: 300 }}
              initialSegment={[0, 30]}
            />
            <p className="mt-4 text-lg font-semibold text-gray-700">
              {isOtpSent ? "Verifying OTP..." : "Sending OTP..."}
            </p>
          </div>
        </div>
      )}
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">Sign Up</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}
        {message && <p className="text-green-500 mb-2">{message}</p>}

        {!isOtpSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              required
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="Candidate">Candidate</option>
              {/* <option value="Admin">Admin</option> */}
            </select>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-secondary transition"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <input
              type="text"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              required
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <p className="text-gray-600">
              OTP Expires In: {Math.floor(otpCountdown / 60)}:
              {otpCountdown % 60}
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-secondary transition"
            >
              Verify OTP
            </button>
          </form>
        )}

        {/* Login link */}
        <p className="mt-4 text-gray-600">
          Already have an account?{" "}
          <button
            className="text-primary font-bold hover:text-secondary transition"
            onClick={() => navigate("/login")}
          >
            Login here!
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
