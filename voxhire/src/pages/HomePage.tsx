import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Team from "../components/Team";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import Profile from "../pages/Profile";
import Header from "../components/Header";
import About from "../components/About";
import MyInterviews from "../components/MyInterviews";
export default function Home() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    profile_picture: string;
  } | null>(null);
  const [activePage, setActivePage] = useState<string>("home");

  // ✅ Create Refs for Sections
  const featuresRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const myinterviewsRef = useRef<HTMLDivElement>(null);

  // ✅ Fetch user profile
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

    // ✅ Listen for profile updates
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

  // ✅ **Scroll Function (Ensures Smooth Scrolling)**
  const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement>) => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ Header (Pass Scroll Functions) */}
      <Header
        setActivePage={setActivePage}
        activePage={activePage}
        onFeatureClick={() => scrollToSection(featuresRef)}
        onContactClick={() => scrollToSection(contactRef)}
        onAboutClick={() => scrollToSection(aboutRef)}
        onMyInterviewsClick={() => scrollToSection(myinterviewsRef)}
      />

      {/* ✅ Dynamically Switch Between Profile & Main Page */}
      {activePage === "profile" ? (
        <Profile />
      ) : (
        <>
          <Hero />
          <div ref={myinterviewsRef} id="interviews" className="pt-20">
            <MyInterviews />
          </div>
          <div ref={featuresRef} id="features" className="pt-20">
            <Features />
          </div>
          <Team />
          <div ref={aboutRef} id="about" className="pt-20">
            <About />
          </div>
          <div ref={contactRef} id="contact" className="pt-20">
            <Contact />
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
