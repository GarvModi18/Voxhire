import { useState } from "react";
import axios from "axios";

export default function CreateInterview() {
  const [interviewData, setInterviewData] = useState({
    post: "",
    difficulty: "Easy",
    duration: "30 min",
    date: "",
    time: "",
    additionalNotes: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [candidateEmails, setCandidateEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // ✅ Success Modal State

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setInterviewData({ ...interviewData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return setUploadMessage("❌ Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/interview/upload-candidates",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ Ensure token is sent
          },
        }
      );

      setFileUrl(response.data.fileUrl);
      setCandidateEmails(response.data.candidateEmails);
      setUploadMessage("✅ File uploaded successfully!");
    } catch (error) {
      console.error("❌ Upload failed:", error);
      setUploadMessage("❌ Upload failed: Server Error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl) return alert("Please upload a candidate file first!");

    setLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/interview/create-interview",
        {
          ...interviewData,
          candidateEmails,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ Ensure token is sent
          },
        }
      );

      setShowSuccessModal(true); // ✅ Show Success Modal
    } catch (error) {
      console.error("❌ Interview creation failed:", error);
      alert("❌ Interview creation failed.");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 bg-gray-100 shadow-lg rounded-md">
      <h2 className="text-2xl font-bold mb-6 text-primary">Create Interview</h2>

      {/* ✅ Upload File Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Upload Candidate List</h3>
        <input
          type="file"
          accept=".pdf,.xlsx"
          onChange={handleFileChange}
          className="border p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        />
        <button
          onClick={handleUpload}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg w-full transition"
        >
          Upload File
        </button>
        {uploadMessage && <p className="mt-2 text-red-600">{uploadMessage}</p>}
      </div>

      {/* ✅ Interview Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="post"
          placeholder="Job Position"
          onChange={handleChange}
          required
          className="border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <select
          name="difficulty"
          onChange={handleChange}
          className="border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <input
          type="text"
          name="duration"
          placeholder="Duration (e.g., 30 min, 1 hour)"
          onChange={handleChange}
          required
          className="border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <input
          type="date"
          name="date"
          onChange={handleChange}
          required
          className="border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <input
          type="time"
          name="time"
          onChange={handleChange}
          required
          className="border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <textarea
          name="additionalNotes"
          placeholder="Admin Instructions"
          onChange={handleChange}
          className="border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <button
          type="submit"
          disabled={!fileUrl}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg w-full transition"
        >
          {loading ? "Processing..." : "Create Interview"}
        </button>
      </form>

      {/* ✅ Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
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
    </div>
  );
}
