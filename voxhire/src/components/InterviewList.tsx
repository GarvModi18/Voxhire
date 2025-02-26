import { useEffect, useState } from "react";
import axios from "axios";

export default function InterviewList() {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/interview/interviews",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ Ensure token is sent
            },
          }
        );
        setInterviews(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch interviews:", error);
      }
    };
    fetchInterviews();
  }, []);

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">📅 Scheduled Interviews</h2>
      {interviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map(
            (
              interview: {
                title: string;
                difficulty: string;
                date: string;
                time: string;
                duration: string;
                post: string;
                candidates: { name: string; email: string }[];
                additional_notes?: string;
              },
              index: number
            ) => (
              <div
                key={index}
                className="bg-background shadow-lg p-4 rounded-lg border-l-4 border-primary"
              >
                <h3 className="text-lg font-bold text-primary mb-2">
                  {interview.title || "Interview"}
                </h3>

                <p>
                  <strong className="text-primary">📌 Post:</strong>{" "}
                  {interview.post}
                </p>
                <p>
                  <strong className="text-primary">📅 Date:</strong>{" "}
                  {interview.date.slice(0, 10)}
                </p>
                <p>
                  <strong className="text-primary">⏰ Time:</strong>{" "}
                  {interview.time}
                </p>
                <p>
                  <strong className="text-primary">🕒 Duration:</strong>{" "}
                  {interview.duration}
                </p>
                <p>
                  <strong className="text-primary">🎯 Difficulty:</strong>{" "}
                  {interview.difficulty}
                </p>

                {/* Candidates List */}
                <p className="mt-2">
                  <strong className="text-primary">👥 Candidates:</strong>
                </p>
                <ul className="list-disc pl-5 text-gray-700">
                  {interview.candidates.map((candidate, i) => (
                    <li key={i}>
                      {candidate.name} ({candidate.email})
                    </li>
                  ))}
                </ul>

                {/* Additional Notes */}
                {interview.additional_notes && (
                  <p className="mt-3">
                    <strong className="text-primary">📝 Notes:</strong>{" "}
                    {interview.additional_notes}
                  </p>
                )}
              </div>
            )
          )}
        </div>
      ) : (
        <p className="text-gray-600">No interviews scheduled.</p>
      )}
    </div>
  );
}
