import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DefaultProfile from "../icons/default-profile.png";
import "../styles/header.css";

interface HeaderProps {
  user: { name: string; profilePic: string } | null;
  setActivePage: (page: string) => void;
  activePage: string;
}

export default function Header({ setActivePage, activePage }: HeaderProps) {
  const [user, setUser] = useState<{ name: string; profilePic: string } | null>(
    null
  );

  // ✅ Fetch user from localStorage (Ensure latest profile pic)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // ✅ Listen for changes to localStorage (Ensures Profile Pic Updates)
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      if (updatedUser) {
        setUser(JSON.parse(updatedUser));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <header className="header-body">
      <div className="logo">
        <a
          href="#"
          onClick={() => setActivePage("home")}
          className={activePage === "home" ? "active" : ""}
        >
          <h1> Voxhire</h1>
        </a>
      </div>
      <nav>
        <ul>
          <li>
            <a
              href="#"
              onClick={() => setActivePage("features")}
              className={activePage === "features" ? "active" : ""}
            >
              Features
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={() => setActivePage("contact")}
              className={activePage === "contact" ? "active" : ""}
            >
              Contact
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={() => setActivePage("about")}
              className={activePage === "about" ? "active" : ""}
            >
              About
            </a>
          </li>
        </ul>
      </nav>
      {user ? (
        <div
          className={`profile ${activePage === "profile" ? "active" : ""}`}
          onClick={() => setActivePage("profile")}
        >
          <img
            src={user.profilePic || DefaultProfile}
            alt="Profile"
            className="profile-pic"
          />
          <span>{user.name}</span>
        </div>
      ) : (
        <Link to="/login" className="login-btn">
          Login
        </Link>
      )}
    </header>
  );
}
