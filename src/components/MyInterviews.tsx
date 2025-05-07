import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useInView } from "../hooks/UseInView";
import { Calendar, Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ✅ Define Interview Type
interface Interview {
  _id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  post: string;
}

// ✅ Fix `useNavigate`
export default function MyInterviews() {
  const navigate = useNavigate();
  const { ref, isVisible } = useInView();
  const [Myinterviews, setMyInterviews] = useState<Interview[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState<boolean>(true); // ✅ Fix setLoading

  // ✅ Fetch All Interviews (Fix API call)
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ No authentication token found!");
          return;
        }

        const { data } = await axios.get(
          `http://localhost:5000/api/interview/candidate-interviews`, // ✅ Correct API URL
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("✅ Fetched interviews:", data);
        setMyInterviews(data);
      } catch (error) {
        console.error("❌ Error fetching interviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  // ✅ Handle Join Interview
  const handleJoinInterview = (id: string) => {
    navigate(`/interview/${id}`); // ✅ Redirect to correct interview page
  };

  // ✅ Handle Search Interview (Fix TypeScript issue)
  const handleSearchInterview = () => {
    if (!sessionId.trim()) return;

    const scoredInterviews = Myinterviews.map((interview: Interview) => {
      let score = 0;
      if (interview._id.includes(sessionId)) score += 10;
      if (interview.post.toLowerCase().includes(sessionId.toLowerCase()))
        score += 5;
      if (interview.title.toLowerCase().includes(sessionId.toLowerCase()))
        score += 3;
      return { ...interview, score };
    });

    const sortedInterviews = scoredInterviews.sort((a, b) => b.score - a.score);
    setMyInterviews(sortedInterviews);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="max-w-6xl mx-auto px-6 py-16"
    >
      {/* ✅ Search Input */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <input
          type="text"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder="Search Interviews..."
          className="border p-3 rounded-lg w-96 shadow-sm focus:ring-2 focus:ring-secondary"
        />
        <button
          onClick={handleSearchInterview}
          className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg shadow-lg transition"
        >
          Search Interview
        </button>
      </div>

      <h2 className="text-3xl font-bold text-primary text-center mb-6">
        Upcoming Interviews
      </h2>

      {/* ✅ Show Loading State */}
      {loading ? (
        <p className="text-center text-gray-600">Loading interviews...</p>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
        >
          {Myinterviews.length > 0 ? (
            Myinterviews.map((interview: Interview, index: number) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <div>
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
                </div>
                <button
                  onClick={() => handleJoinInterview(interview._id)}
                  className="bg-primary text-white px-4 py-2 rounded-lg mt-4 w-full hover:bg-secondary transition"
                >
                  Join Interview
                </button>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-center text-gray-600">
                No Interviews available.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
