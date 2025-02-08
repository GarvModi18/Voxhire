import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    profilePic: string;
  } | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login"); // Redirect if not logged in
    }
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="profile-container">
      <h1 className="voxhire-title">Voxhire</h1>
      <h2>Profile</h2>

      {user ? (
        <div className="profile-card">
          <img
            src={user.profilePic || "/images/default-profile.png"} // Default image if no profile pic
            alt="Profile"
            className="profile-img"
          />
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <p>Loading user details...</p>
      )}
    </div>
  );
}
