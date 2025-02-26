import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useInView } from "../hooks/UseInView";
import { Calendar, Clock, FileText } from "lucide-react";

export default function Interviews() {
  const { ref, isVisible } = useInView();
  const [interviews, setInterviews] = useState([]);
  const [sessionId, setSessionId] = useState("");
  useEffect(() => {
    const fetchCandidateInterviews = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/interview/candidate-interviews",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setInterviews(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch candidate interviews:", error);
      }
    };

    fetchCandidateInterviews();
  }, []);

  // ✅ Handle Join Interview
  const handleJoinInterview = (id: string) => {
    alert(`Joining interview: ${id}`);
    // Redirect or handle interview joining logic
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="max-w-6xl mx-auto px-6 py-16"
    >
      {/* ✅ Session ID Input & Join Button */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <input
          type="text"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder="Enter Session ID..."
          className="border p-3 rounded-lg w-96 shadow-sm focus:ring-2 focus:ring-secondary"
        />
        <button
          onClick={() => handleJoinInterview(sessionId)}
          className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg shadow-lg transition"
        >
          Join Interview
        </button>
      </div>

      <h2 className="text-3xl font-bold text-primary text-center mb-6">
        Upcoming Interviews
      </h2>

      {/* ✅ Interviews Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
        }}
      >
        {interviews.length > 0 ? (
          interviews.map(
            (
              interview: {
                _id: string;
                title: string;
                date: string;
                time: string;
                duration: string;
                post: string;
              },
              index: number
            ) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.9 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                className="bg-white p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-2xl"
              >
                {/* ✅ Interview Title */}
                <h3 className="text-2xl font-semibold text-primary mb-3">
                  {interview.title}
                </h3>

                {/* ✅ Interview Details */}
                <div className="text-gray-600 space-y-2">
                  <p className="flex items-center">
                    <Calendar className="text-secondary w-5 h-5 mr-2" />
                    <strong>Date:</strong> {interview.date.slice(0, 10)}
                  </p>
                  <p className="flex items-center">
                    <Clock className="text-secondary w-5 h-5 mr-2" />
                    <strong>Time:</strong> {interview.time} (
                    {interview.duration})
                  </p>

                  <p className="flex items-center">
                    <FileText className="text-secondary w-5 h-5 mr-2" />
                    <strong>Post:</strong> {interview.post}
                  </p>
                </div>

                {/* ✅ Join Interview Button */}
                <button
                  onClick={() => handleJoinInterview(interview._id)}
                  className="bg-primary text-white px-4 py-2 rounded-lg mt-4 w-full hover:bg-secondary transition"
                >
                  Join Interview
                </button>
              </motion.div>
            )
          )
        ) : (
          <p className="text-center text-gray-600 col-span-3">
            No interviews available.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
