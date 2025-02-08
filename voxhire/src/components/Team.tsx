import { motion } from "framer-motion";
import { useInView } from "../hooks/UseInView";
import "../styles/team.css";
const teamMembers = [
  { name: "Garv Modi", role: "Backend Devloper", img: "/team1.jpg" },
  { name: "Dhruvi Lolariya", role: "Frontend Devloper", img: "/team2.jpg" },
  { name: "Krish Thakkar", role: "UI/UX Designer", img: "/team3.jpg" },
];

export default function Team() {
  const { ref, isVisible } = useInView();

  return (
    <motion.section
      ref={ref}
      className="team"
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <h2 className="titles">Meet Our Team</h2>
      <div className="team-grid">
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            className="team-card"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: index * 0.2, duration: 0.5 }}
          >
            <img src={member.img} alt={member.name} />
            <div className="team-info">
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
