import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DefaultProfile from "../icons/default-profile.png";
interface HeaderProps {
  setActivePage: (page: string) => void;
  activePage: string;
  onFeatureClick: () => void;
  onContactClick: () => void;
  onAboutClick: () => void;
  onMyInterviewsClick: () => void;
}

export default function Header({
  setActivePage,
  activePage,
  onFeatureClick,
  onContactClick,
  onAboutClick,
  onMyInterviewsClick,
}: HeaderProps) {
  const [user, setUser] = useState<{
    name: string;
    profile_picture: string;
  } | null>(null);

  // ✅ Fetch user from localStorage (Ensure latest profile pic)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // ✅ Listen for profile updates
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
    <header className="w-full bg-dark-background text-white px-6 py-4 flex justify-between items-center fixed top-0 z-50 shadow-md">
      {/* ✅ Logo */}
      <div>
        <a
          href="/"
          onClick={() => setActivePage("home")}
          className={`text-3xl text-white font-bold transition ${
            activePage === "home" ? "text-white" : "text-secondary"
          }`}
        >
          Voxhire
        </a>
      </div>

      {/* ✅ Navigation Menu */}
      <nav>
        <ul className="flex gap-6">
          <li>
            <button
              onClick={() => {
                onMyInterviewsClick();
                setActivePage("interviews");
              }}
              className={`text-lg font-semibold transition ${
                activePage === "" ? "text-secondary" : "hover:text-secondary"
              }`}
            >
              Interviews
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                onFeatureClick();
                setActivePage("features");
              }}
              className={`text-lg font-semibold transition ${
                activePage === "" ? "text-secondary" : "hover:text-secondary"
              }`}
            >
              Features
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                onAboutClick();
                setActivePage("about");
              }}
              className={`text-lg font-semibold transition ${
                activePage === "" ? "text-secondary" : "hover:text-secondary"
              }`}
            >
              About
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                onContactClick();
                setActivePage("contact");
              }}
              className={`text-lg font-semibold transition ${
                activePage === "" ? "text-secondary" : "hover:text-secondary"
              }`}
            >
              Contact
            </button>
          </li>
        </ul>
      </nav>

      {/* ✅ Profile or Login */}
      {user ? (
        <div
          className={`flex items-center gap-3 cursor-pointer ${
            activePage === "" ? "text-secondary font-bold" : ""
          }`}
          onClick={() => setActivePage("profile")}
        >
          <img
            src={user.profile_picture || DefaultProfile}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover border-2 border-white"
          />
          <span className="text-lg font-semibold hover:text-secondary">
            {user.name}
          </span>
        </div>
      ) : (
        <Link
          to="/login"
          className="px-4 py-2 rounded-md border border-white hover:border-secondary transition"
        >
          Login
        </Link>
      )}
    </header>
  );
}
