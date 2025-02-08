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
            Voxhire is an innovative platform that helps job seekers excel in
            interviews with
            <i>
              {" "}
              <b>AI-driven simulations</b>
            </i>{" "}
            and{" "}
            <i>
              <b>real-time feedback</b>
            </i>{" "}
            . We empower candidates with the{" "}
            <i>
              <b>confidence and skills</b>
            </i>{" "}
            they need to land their dream jobs.
          </p>
          <p>
            Our mission is to bridge the gap between talent and opportunity by
            offering{" "}
            <i>
              <b>personalized training</b>
            </i>{" "}
            that adapts to each user's strengths and weaknesses.
          </p>
          <p>
            At Voxhire, we believe that <b>everyone deserves a fair chance</b>{" "}
            to showcase their potential. Join us and take the first step toward
            <b>career success</b> today!
          </p>
        </div>
      </motion.div>
    </motion.section>
  );
}
