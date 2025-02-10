import { useEffect, useState } from "react";
import axios from "axios";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Team from "../components/Team";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import Profile from "../pages/Profile";
import Header from "../components/Header"; // ✅ Import Header
import "../styles/Home.css";
import About from "../components/About";

export default function Home() {
  const [user, setUser] = useState<{ name: string; profilePic: string } | null>(
    null
  );
  const [activePage, setActivePage] = useState<string>("home"); // Track current page

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          "http://localhost:5000/api/auth/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();

    // ✅ Listen for profile pic updates
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
  }, []);

  return (
    <div>
      {/* ✅ Use Header Component */}
      <Header
        user={user}
        setActivePage={setActivePage}
        activePage={activePage}
      />

      {/* ✅ Dynamically Render Sections Based on Active Page */}
      {activePage === "profile" ? (
        <Profile />
      ) : (
        <>
          <Hero />
          <Features />
          <Team />
          <About />
          <Contact />
        </>
      )}

      <Footer />
    </div>
  );
}
