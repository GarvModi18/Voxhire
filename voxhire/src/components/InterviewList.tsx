import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import React from "react";

interface InterviewFilters {
  status?: string;
  interviewType?: string;
  page: number;
  limit: number;
}

interface Candidate {
  name: string;
  email: string;
  status: string;
}

interface Interview {
  _id: string;
  title: string;
  post: string;
  difficulty: string;
  duration: number;
  date: string;
  time: string;
  status: string;
  interview_type: string;
  candidates: Candidate[];
  created_at: string;
  additional_notes?: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  pages: number;
}

interface InterviewListProps {
  filters: InterviewFilters;
  onPageChange: (page: number) => void;
}

const InterviewList = ({ filters, onPageChange }: InterviewListProps) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pages: 1,
  });
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null
  );
  const [expandedInterviewId, setExpandedInterviewId] = useState<string | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  const apiBaseUrl = "http://localhost:5000/api";

  useEffect(() => {
    fetchInterviews();
  }, [filters]);

  const fetchInterviews = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.interviewType)
        queryParams.append("interviewType", filters.interviewType);
      queryParams.append("page", filters.page.toString());
      queryParams.append("limit", filters.limit.toString());

      const response = await axios.get(
        `${apiBaseUrl}/interview/interviews?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.interviews) {
        setInterviews(response.data.interviews);
        setPagination(
          response.data.pagination || {
            total: response.data.interviews.length,
            page: filters.page,
            pages: Math.ceil(response.data.interviews.length / filters.limit),
          }
        );
      } else {
        setInterviews(response.data);
        // Estimate pagination if not provided
        setPagination({
          total: response.data.length,
          page: filters.page,
          pages: Math.ceil(response.data.length / filters.limit),
        });
      }
    } catch (err) {
      console.error("Error fetching interviews:", err);
      setError("Failed to load interviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get candidate status badge color
  const getCandidateStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "invited":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "attended":
        return "bg-purple-100 text-purple-800";
      case "no-show":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fetch detailed interview data
  const fetchInterviewDetails = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await axios.get(
        `${apiBaseUrl}/interview/current/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSelectedInterview(response.data);
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Error fetching interview details:", err);
      setError("Failed to load interview details. Please try again.");
    }
  };

  // Toggle candidate list expansion
  const toggleCandidateList = (id: string) => {
    if (expandedInterviewId === id) {
      setExpandedInterviewId(null);
    } else {
      setExpandedInterviewId(id);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold p-4 border-b">Interview Sessions</h2>

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interviews...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchInterviews}
            className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition"
          >
            Try Again
          </button>
        </div>
      ) : interviews.length === 0 ? (
        <div className="p-8 text-center text-gray-600">
          <p>No interviews found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {interviews.map((interview) => (
                  <React.Fragment key={interview._id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {interview.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-md text-gray-500">
                          {interview.post}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(interview.date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {interview.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {interview.interview_type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(interview.status)}`}
                        >
                          {interview.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => toggleCandidateList(interview._id)}
                          className="flex items-center text-primary hover:text-secondary"
                        >
                          {interview.candidates?.length || 0} candidates
                          <svg
                            className={`ml-1 h-4 w-4 transform ${
                              expandedInterviewId === interview._id
                                ? "rotate-180"
                                : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-even text-sm font-medium">
                        <button
                          onClick={() => fetchInterviewDetails(interview._id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-5"
                        >
                          View
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Cancel
                        </button>
                      </td>
                    </tr>
                    {expandedInterviewId === interview._id && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="text-sm text-gray-900 font-medium mb-2">
                            Candidates:
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200 border">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Name
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Email
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {interview.candidates.map((candidate, idx) => (
                                  <tr key={idx} className="hover:bg-gray-100">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                      {candidate.name || "N/A"}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                      {candidate.email}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                      <span
                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCandidateStatusColor(
                                          candidate.status
                                        )}`}
                                      >
                                        {candidate.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(pagination.page - 1) * filters.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(pagination.page * filters.limit, pagination.total)}
              </span>{" "}
              of <span className="font-medium">{pagination.total}</span> results
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 py-1 rounded-md ${
                  pagination.page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-secondary"
                }`}
              >
                Previous
              </button>

              {/* Page number buttons */}
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                // Show pages around current page
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-3 py-1 rounded-md ${
                      pagination.page === pageNum
                        ? "bg-primary text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`px-3 py-1 rounded-md ${
                  pagination.page === pagination.pages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-secondary"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Interview Details Modal */}
      {showDetailsModal && selectedInterview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  {selectedInterview.title}
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Interview Details
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Position</p>
                        <p className="font-medium">{selectedInterview.post}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Difficulty</p>
                        <p className="font-medium">
                          {selectedInterview.difficulty}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium">
                          {selectedInterview.interview_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">
                          {selectedInterview.duration} minutes
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">
                          {formatDate(selectedInterview.date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium">{selectedInterview.time}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedInterview.status)}`}
                        >
                          {selectedInterview.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="font-medium">
                          {formatDate(selectedInterview.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Additional Notes
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg h-full">
                    <p className="text-gray-700">
                      {selectedInterview.additional_notes ||
                        "No additional notes provided."}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Candidates ({selectedInterview.candidates.length})
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedInterview.candidates.map((candidate, idx) => (
                        <tr key={idx} className="hover:bg-white">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {candidate.name || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {candidate.email}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCandidateStatusColor(candidate.status)}`}
                            >
                              {candidate.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-2">
                              Send Reminder
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
                {selectedInterview.status.toLowerCase() !== "cancelled" && (
                  <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                    Cancel Interview
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewList;
