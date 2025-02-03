import { motion } from "framer-motion";
import { useInView } from "../hooks/UseInView";
import { CheckCircle } from "lucide-react";

export default function Features() {
  const { ref, isVisible } = useInView();

  return (
    <motion.section
      ref={ref}
      className="features container"
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <h2>Why Choose Voxhire?</h2>
      <div className="feature-grid">
        {[
          {
            title: "AI-Powered Practice",
            description: "Realistic interview simulations with AI.",
          },
          {
            title: "Personalized Feedback",
            description: "Get detailed insights on your performance.",
          },
          {
            title: "Extensive Question Bank",
            description: "Access thousands of industry-specific questions.",
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            className="feature-item"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: index * 0.2, duration: 0.5 }}
          >
            <CheckCircle className="icon" />
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
