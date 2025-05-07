import { motion } from "framer-motion";
import { useInView } from "../hooks/UseInView";

export default function About() {
  const { ref, isVisible } = useInView();

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="bg-primary text-background text-center py-12 px-6"
    >
      <h2 className="text-3xl font-bold mb-6">About Us</h2>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:flex-row items-center justify-center gap-10 max-w-5xl mx-auto"
      >
        <div className="text-background text-lg text-left w-full md:w-3/4">
          <p className="mb-4">
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
          <p className="mb-4">
            Our mission is to bridge the gap between talent and opportunity by
            offering{" "}
            <i>
              <b>personalized training</b>
            </i>{" "}
            that adapts to each user's strengths and weaknesses.
          </p>
          <p className="mb-4">
            At Voxhire, we believe that <b>everyone deserves a fair chance</b>{" "}
            to showcase their potential. Join us and take the first step toward
            <b> career success</b> today!
          </p>
        </div>
      </motion.div>
    </motion.section>
  );
}
