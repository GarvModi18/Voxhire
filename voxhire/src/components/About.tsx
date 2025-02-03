import { motion } from "framer-motion";
import { useInView } from "../hooks/UseInView";
import "../styles/about.css";

export default function About() {
  const { ref, isVisible } = useInView();

  return (
    <motion.section
      ref={ref}
      className="about"
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <h2>About Us</h2>
      <motion.div
        className="about-container"
        initial={{ opacity: 0, y: 50 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="about-text">
          <p>
            Voxhire is a revolutionary platform that helps job seekers prepare
            for interviews with AI-driven simulations and personalized feedback.
          </p>
          <p>
            Our goal is to bridge the gap between talent and opportunity by
            providing top-notch interview training.
          </p>
        </div>
        <div className="about-image">
          <img src="/about-image.jpg" alt="About Voxhire" />
        </div>
      </motion.div>
    </motion.section>
  );
}
