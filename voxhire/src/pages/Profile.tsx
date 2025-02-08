import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", profilePic: "" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <img
        src={user.profilePic || "/default-profile.png"}
        alt="Profile"
        className="profile-img"
      />
      <h3>{user.name}</h3>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
