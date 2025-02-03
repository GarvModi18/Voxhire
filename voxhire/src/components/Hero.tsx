import { motion } from "framer-motion";
import { useInView } from "../hooks/UseInView";
import "../styles/hero.css";

export default function Hero() {
  const { ref, isVisible } = useInView();

  return (
    <motion.section
      ref={ref}
      className="hero"
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <h1>Master Your Interviews</h1>
      <p>
        Prepare, practice, and perfect your interview skills with our AI-powered
        platform.
      </p>
      <button className="btn">Get Started</button>
    </motion.section>
  );
}
