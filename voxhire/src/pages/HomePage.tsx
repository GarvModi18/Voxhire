import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Team from "../components/Team";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import "../styles/Home.css";
import About from "../components/About";
import DefaultProfile from "../icons/default-profile.png";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; profilePic: string } | null>(
    null
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          "http://localhost:5000/api/auth/profile",
          {
            // ✅ FIXED URL
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div>
      {/* Header */}
      <header className="container">
        <div className="text-2xl font-bold">Voxhire</div>
        <nav>
          <ul>
            <li>
              <a href="#">Features</a>
            </li>
            <li>
              <a href="#">Pricing</a>
            </li>
            <li>
              <a href="#">About</a>
            </li>
          </ul>
        </nav>
        {user ? (
          <div className="profile" onClick={() => navigate("/profile")}>
            <img
              src={user.profilePic || DefaultProfile}
              alt="Profile"
              className="profile-pic"
            />
            <span>{user.name}</span>
          </div>
        ) : (
          <a href="/login" className="login-btn">
            Login
          </a>
        )}
      </header>

      {/* Sections */}
      <Hero />
      <Features />
      <Team />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}
