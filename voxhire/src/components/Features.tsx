import { motion } from "framer-motion";
import { useInView } from "../hooks/UseInView";
import {
  Mic,
  Code,
  BarChart3,
  LayoutDashboard,
  User,
  MessageSquare,
  ShieldCheck,
  FileText,
} from "lucide-react";
import "../styles/features.css";

export default function Features() {
  const { ref, isVisible } = useInView();

  const features = [
    {
      title: "Real-Time Speech Analysis",
      description: "AI-powered voice recognition for accurate assessment.",
      icon: Mic,
    },
    {
      title: "Live Coding Environment",
      description: "Solve coding challenges with an interactive editor.",
      icon: Code,
    },
    {
      title: "Automated Scoring",
      description: "Instant performance evaluation with AI-driven insights.",
      icon: BarChart3,
    },
    {
      title: "Admin Dashboard",
      description: "View AI-evaluated scores and assess candidate performance.",
      icon: LayoutDashboard,
    },
    {
      title: "AI Avatar Interaction",
      description:
        "Engage with a realistic AI interviewer for a human-like experience.",
      icon: User,
    },
    {
      title: "Personalized Feedback",
      description: "Get detailed insights on your performance.",
      icon: MessageSquare,
    },
    {
      title: "Secure and Scalable",
      description: "Built with robust security and scalable infrastructure.",
      icon: ShieldCheck,
    },
    {
      title: "Comprehensive Performance Reports",
      description:
        "Detailed reports with strengths, weaknesses, and improvement tips.",
      icon: FileText,
    },
  ];

  return (
    <motion.section
      ref={ref}
      className="features-container"
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <h2 className="features-title">Why Choose Voxhire?</h2>

      {/* 2-row × 4-column grid */}
      <div className="features-grid">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="feature-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
          >
            <feature.icon className="feature-icon" />
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
