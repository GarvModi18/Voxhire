import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Profile.css";
import DefaultProfile from "../icons/default-profile.png";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    profilePic: string;
  } | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Open the modal when user clicks on the profile picture
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null); // Reset selected file on cancel
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Handle file upload
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

      // ✅ Update user data in localStorage
      const updatedUser = { ...user, profilePic: response.data.profilePic };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // ✅ Refresh homepage profile picture
      window.dispatchEvent(new Event("storage"));

      setMessage("Profile picture updated successfully!");
      closeModal();
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`profile-body ${isModalOpen ? "blurred" : ""}`}>
      <div className="profile-container">
        <h1 className="voxhire-title">Voxhire</h1>
        <h2>Profile</h2>

        {user ? (
          <div className="profile-card">
            <img
              src={user.profilePic || DefaultProfile}
              alt="Profile"
              className="profile-img"
              onClick={openModal} // Open modal when clicked
            />
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>

            {/* Logout */}
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <p>Loading user details...</p>
        )}

        {/* Profile Picture Upload Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Change Profile Picture</h3>
              <img
                src={
                  selectedFile
                    ? URL.createObjectURL(selectedFile)
                    : user?.profilePic || DefaultProfile
                }
                alt="Selected Preview"
                className="preview-img"
              />
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <div className="modal-buttons">
                <button onClick={handleUpload} disabled={loading}>
                  {loading ? "Uploading..." : "Upload"}
                </button>
                <button className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
              </div>
              {message && <p className="success-message">{message}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
