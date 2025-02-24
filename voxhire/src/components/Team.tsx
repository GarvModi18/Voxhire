import { motion } from "framer-motion";
import { useInView } from "../hooks/UseInView";
import { Database, Code, Palette } from "lucide-react"; // ✅ Icons for Roles

const teamMembers = [
  { name: "Garv Modi", role: "Backend Developer", icon: Database },
  { name: "Dhruvi Lolariya", role: "Frontend Developer", icon: Code },
  { name: "Krish Thakkar", role: "UI/UX Designer", icon: Palette },
];

export default function Team() {
  const { ref, isVisible } = useInView();

  return (
    <motion.section
      ref={ref}
      className="bg-gray-100 text-center py-16 px-6"
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.h2
        className="text-4xl font-bold text-primary mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        Meet Our Team
      </motion.h2>

      <div className="flex flex-wrap justify-center gap-6">
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            className="bg-white text-black p-6 rounded-lg shadow-lg border-2 border-primary w-72 flex flex-col items-center transition-transform"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.3, ease: "easeInOut" },
            }}
            whileTap={{ scale: 0.98 }}
          >
            {/* ✅ Dynamic Icon */}
            <member.icon className="text-primary w-14 h-14 mb-4 transition-transform transform hover:rotate-6" />

            <h3 className="text-lg font-bold text-primary">{member.name}</h3>
            <p className="text-gray-600 mt-2">{member.role}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
