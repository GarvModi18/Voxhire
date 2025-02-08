import { motion } from "framer-motion";
import { useInView } from "../hooks/UseInView";
import "../styles/hero.css";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const { ref, isVisible } = useInView();
  const navigate = useNavigate();
  return (
    <motion.section
      ref={ref}
      className="hero"
      initial={{ opacity: 1, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <h1>Master Your Interviews</h1>
      <p>
        Prepare, practice, and perfect your interview skills with our AI-powered
        platform.
      </p>
      <button className="btn" onClick={() => navigate("/signup")}>
        Get Started
      </button>
    </motion.section>
  );
}
