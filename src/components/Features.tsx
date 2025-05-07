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
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="max-w-6xl mx-auto px-6 py-16 text-center"
    >
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-4xl font-bold text-primary mb-8"
      >
        Why Choose Voxhire?
      </motion.h2>

      {/* Grid Layout for Features */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 },
          },
        }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            className="bg-white p-6 rounded-xl shadow-lg text-center transform transition-all duration-300 hover:shadow-2xl"
          >
            <feature.icon className="text-primary w-14 h-14 mx-auto mb-4 transition-transform transform hover:rotate-6" />
            <h3 className="text-xl font-semibold text-primary">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 mt-2">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
