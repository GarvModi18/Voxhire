import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DefaultProfile from "../icons/default-profile.png";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    profile_picture: string;
  } | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Fetch user profile from API (not just localStorage)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/auth/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // ✅ Update state & localStorage with latest data
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/login");
      }
    };

    fetchUser();

    // ✅ Listen for profile updates across the app
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ✅ Open & Close Modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  // ✅ Handle File Selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // ✅ Handle Profile Picture Upload
  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("email", user.email);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/auth/upload-profile-pic",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ Fetch updated user profile after upload
      const updatedUser = {
        ...user,
        profile_picture: response.data.profilePic,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // ✅ Dispatch event to refresh UI across all pages
      window.dispatchEvent(new Event("storage"));

      setMessage("✅ Profile picture updated successfully!");
      closeModal();
    } catch (error: any) {
      setMessage(error.response?.data?.message || "❌ Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 my-40 rounded-lg shadow-lg text-center w-96">
        <h1 className="text-3xl font-bold text-primary">Voxhire</h1>
        <h2 className="text-xl font-semibold text-gray-800 mt-2">Profile</h2>

        {user ? (
          <div className="flex flex-col items-center mt-6">
            <img
              src={user.profile_picture || DefaultProfile}
              alt="Profile"
              className="w-24 h-24 rounded-full cursor-pointer border-4 border-primary hover:scale-110 transition"
              onClick={openModal}
            />
            <p className="text-lg font-medium mt-4">
              <strong>Name:</strong> {user.name}
            </p>
            <p className="text-lg font-medium">
              <strong>Email:</strong> {user.email}
            </p>

            {/* ✅ Logout Button */}
            <button
              className="bg-primary text-white py-2 px-4 rounded-lg mt-4 hover:bg-secondary transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <p className="text-gray-600">Loading user details...</p>
        )}

        {/* ✅ Profile Picture Upload Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
              <h3 className="text-xl font-semibold text-primary mb-4">
                Change Profile Picture
              </h3>
              <img
                src={
                  selectedFile
                    ? URL.createObjectURL(selectedFile)
                    : user?.profile_picture || DefaultProfile
                }
                alt="Selected Preview"
                className="w-24 h-24 rounded-full mx-auto"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-4 border p-2 w-full rounded-lg"
              />
              <div className="flex justify-between mt-4">
                <button
                  className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-secondary transition w-1/2 mr-2"
                  onClick={handleUpload}
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Upload"}
                </button>
                <button
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition w-1/2"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
              {message && <p className="text-green-500 mt-3">{message}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
