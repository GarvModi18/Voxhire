import { motion } from "framer-motion";
import { useInView } from "../hooks/UseInView";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const { ref, isVisible } = useInView();
  const navigate = useNavigate();

  return (
    <motion.section
      ref={ref}
      className="flex flex-col items-center text-center px-6 py-60 my-15 bg-gray-100"
      initial={{ opacity: 1, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
        Master Your Interviews
      </h1>
      <p className="text-lg text-gray-700 max-w-xl mb-6">
        Experience real-time AI-driven interviews and get instant performance
        feedback. Conduct your interviews seamlessly with our intuitive
        platform. Smart hiring needs smart choices, choose us for a seamless and
        efficient interview experience!
      </p>
      <button
        className="bg-primary text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-secondary transition duration-300"
        onClick={() => navigate("/login")}
      >
        Get Started
      </button>
    </motion.section>
  );
}
