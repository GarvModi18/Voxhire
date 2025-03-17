import { useState } from "react";
import axios from "axios";
import Lottie from "lottie-react";
import LoadingAnimation from "../icons/LoadingAnimation.json";
import NoFileAnimation from "../icons/NoFileAnimation.json";

export default function CreateInterview() {
  const [interviewData, setInterviewData] = useState({
    post: "",
    difficulty: "Easy",
    duration: 30,
    date: "",
    time: "",
    type: "Mixed",
    additionalNotes: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [createMessage, setCreateMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "duration") {
      const durationNumber = parseInt(value);
      if (!isNaN(durationNumber)) {
        setInterviewData({ ...interviewData, [name]: durationNumber });
      }
    } else {
      setInterviewData({ ...interviewData, [name]: value });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form fields
    if (
      !interviewData.post ||
      !interviewData.difficulty ||
      !interviewData.date ||
      !interviewData.time
    ) {
      setCreateMessage("❌ Please fill in all required fields");
      return;
    }

    // Check if file is selected
    if (!file) {
      setShowWarningModal(true);
      return;
    }

    setLoading(true);
    setCreateMessage("");

    try {
      // Step 1: Upload the file first
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await axios.post(
        "http://localhost:5000/api/interview/upload-candidates",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("File upload response:", uploadResponse.data);

      if (
        !uploadResponse.data.candidateEmails ||
        uploadResponse.data.candidateEmails.length === 0
      ) {
        setCreateMessage("❌ No valid candidate emails found in the file");
        setLoading(false);
        return;
      }

      // Step 2: Create the interview with the extracted candidate data
      const { candidateEmails, candidateNames, fileUrl } = uploadResponse.data;

      const createResponse = await axios.post(
        "http://localhost:5000/api/interview/create-interview",
        {
          ...interviewData,
          candidateEmails,
          candidateNames,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Interview creation response:", createResponse.data);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("❌ Process failed:", error);

      // Determine if error happened during upload or creation
      if (
        error.response?.status === 400 &&
        error.response?.data?.message?.includes("No valid emails")
      ) {
        setCreateMessage("❌ No valid emails found in the uploaded file");
      } else if (
        error.response?.status === 400 &&
        error.response?.data?.message?.includes("Excel file is empty")
      ) {
        setCreateMessage("❌ The uploaded Excel file is empty");
      } else if (error.response?.status === 401) {
        setCreateMessage("❌ Authentication error: Please log in again");
      } else {
        setCreateMessage(
          `❌ Error: ${error.response?.data?.message || "Failed to create interview"}`
        );
      }
    }

    setLoading(false);
  };
  return (
    <div className="p-8 shadow-xl rounded-md">
      <h2 className="text-2xl font-bold mb-6 text-primary">Create Interview</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Upload Section */}
        <div className="mb-6">
          <label
            htmlFor="candidateFile"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Upload Candidate List (Excel) *
          </label>
          <input
            id="candidateFile"
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="border-primary border p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          />
          {file && (
            <p className="text-green-600 text-sm">
              ✓ File selected: {file.name}
            </p>
          )}
        </div>

        {/* Interview Details */}
        <div>
          <label
            htmlFor="post"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Job Position *
          </label>
          <input
            type="text"
            id="post"
            name="post"
            value={interviewData.post}
            placeholder="e.g., Software Engineer"
            onChange={handleChange}
            required
            className="border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-primary"
          />
        </div>

        <div>
          <label
            htmlFor="difficulty"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Difficulty Level *
          </label>
          <select
            id="difficulty"
            name="difficulty"
            value={interviewData.difficulty}
            onChange={handleChange}
            required
            className="border-primary border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Interview Type *
          </label>
          <select
            id="type"
            name="type"
            value={interviewData.type}
            onChange={handleChange}
            required
            className="border-primary border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Q&A">Q&A</option>
            <option value="Technical">Technical</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Duration (minutes) *
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            min="5"
            value={interviewData.duration}
            onChange={handleChange}
            required
            className="border-primary border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={interviewData.date}
            onChange={handleChange}
            required
            className="border-primary border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label
            htmlFor="time"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Time *
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={interviewData.time}
            onChange={handleChange}
            required
            className="border-primary border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label
            htmlFor="additionalNotes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Admin Instructions
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={interviewData.additionalNotes}
            placeholder="Additional instructions for the interview"
            onChange={handleChange}
            className="border-primary border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-primary hover:bg-white text-white hover:text-primary hover:border-2 hover:border-primary px-4 py-2 rounded-lg w-full transition mt-6"
        >
          {loading ? "Processing..." : "Create Interview"}
        </button>

        {createMessage && (
          <p
            className={`mt-2 ${createMessage.includes("❌") ? "text-red-600" : "text-green-600"}`}
          >
            {createMessage}
          </p>
        )}
      </form>

      {/* Loading Animation */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
            <Lottie animationData={LoadingAnimation} loop={true} />
            <p className="text-gray-700 mt-2">Processing your request...</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
            <h3 className="text-xl font-semibold text-green-600 mb-4">
              🎉 Interview Created Successfully!
            </h3>
            <p className="text-gray-700">
              Your interview session has been successfully created and
              invitations have been sent to candidates.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white max-w-sm w-full p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold text-red-600 mb-4">
              ⚠️ Action Required
            </h3>
            <p className="text-gray-700">
              Please select a candidate list file before creating an interview!
            </p>
            <Lottie animationData={NoFileAnimation} loop={true} />
            <button
              onClick={() => setShowWarningModal(false)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
