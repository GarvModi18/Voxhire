import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Define TypeScript interfaces for better type safety
interface TestCase {
  input: string;
  expected_output: string;
}

interface LanguageOption {
  id: number;
  name: string;
  defaultCode: string;
}

const CodingInterview = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState<string>("// Write your code here");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  // Removed unused score state
  const [languageId, setLanguageId] = useState<number>(71); // Python (Judge0 ID: 71)
  const [showFinishDialog, setShowFinishDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [interviewCompleted, setInterviewCompleted] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const apiBaseUrl =
    process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Language options mapping
  const languageOptions: LanguageOption[] = [
    {
      id: 71,
      name: "Python",
      defaultCode:
        "# Write your Python code here\n\ndef solution():\n    # Your solution here\n    return\n\nprint(solution())",
    },
    {
      id: 63,
      name: "JavaScript",
      defaultCode:
        "// Write your JavaScript code here\n\nfunction solution() {\n    // Your solution here\n    return;\n}\n\nconsole.log(solution());",
    },
    {
      id: 54,
      name: "C++",
      defaultCode:
        '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your solution here\n    cout << "Hello World!" << endl;\n    return 0;\n}',
    },
    {
      id: 62,
      name: "Java",
      defaultCode:
        'public class Main {\n    public static void main(String[] args) {\n        // Your solution here\n        System.out.println("Hello World!");\n    }\n}',
    },
  ];

  // Extract test cases from question text
  const extractTestCases = (questionText: string): TestCase[] => {
    try {
      // This is a simple regex pattern - you might need to adjust based on your actual question format
      const testCaseRegex = /Input:\s*(.*?)\s*Output:\s*(.*?)(?=Input:|$)/gs;
      const matches = [...questionText.matchAll(testCaseRegex)];

      if (matches.length > 0) {
        return matches.map((match) => ({
          input: match[1].trim(),
          expected_output: match[2].trim(),
        }));
      } else {
        // Fallback to default test cases if none found in the question
        return [
          { input: "test input 1", expected_output: "expected output 1" },
          { input: "test input 2", expected_output: "expected output 2" },
        ];
      }
    } catch (error) {
      console.error("Error extracting test cases:", error);
      return [
        { input: "test input 1", expected_output: "expected output 1" },
        { input: "test input 2", expected_output: "expected output 2" },
      ];
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to access this page");
      navigate("/login");
      return;
    }

    generateQuestions();
  }, [navigate]);

  // Set default code when language changes
  useEffect(() => {
    const selectedLanguage = languageOptions.find(
      (lang) => lang.id === languageId
    );
    if (selectedLanguage) {
      setCode(selectedLanguage.defaultCode);
    }
  }, [languageId]);

  // Extract test cases when question changes
  useEffect(() => {
    if (currentQuestion) {
      const extractedTestCases = extractTestCases(currentQuestion);
      setTestCases(extractedTestCases);
      // Reset test results when question changes
      setTestResults([]);
    }
  }, [currentQuestion]);

  // 🟢 Generate All Questions at Start
  const generateQuestions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No authentication token found!");
        return;
      }

      const { data } = await axios.post(
        `${apiBaseUrl}/interview/generate-coding-questions`,
        {
          post: "Software Engineer",
          difficulty: "Medium", // You can make this dynamic based on user selection
          additional_notes: "Focus on algorithms and data structures",
          interview_id:
            localStorage.getItem("interview_id") || "coding_session",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "user-id": localStorage.getItem("userId") || "anonymous",
          },
        }
      );

      setTotalQuestions(data.questions);
      fetchNextQuestion();
    } catch (error) {
      console.error("❌ Error generating questions:", error);
      setOutput(
        "Failed to generate questions. Please try again or contact support."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 Fetch Next Question
  const fetchNextQuestion = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No authentication token found!");
        return;
      }

      const { data } = await axios.get(
        `${apiBaseUrl}/interview/get-next-question`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "user-id": localStorage.getItem("userId") || "anonymous",
          },
        }
      );

      if (data.message && data.message.includes("All questions answered")) {
        setCurrentQuestion("All questions answered. Click 'Finish Interview'.");
        setInterviewCompleted(true);
      } else {
        setCurrentQuestion(data.question);
        // Reset code to default for the selected language
        const selectedLanguage = languageOptions.find(
          (lang) => lang.id === languageId
        );
        if (selectedLanguage) {
          setCode(selectedLanguage.defaultCode);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching next question:", error);
      setOutput("Failed to fetch the next question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 Run Code (without evaluation)
  const runCode = async () => {
    setIsRunning(true);
    setError("");
    setOutput("Running your code...");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No authentication token found!");
        return;
      }

      const { data } = await axios.post(
        `${apiBaseUrl}/interview/execute`,
        {
          code,
          languageId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "user-id": localStorage.getItem("userId") || "anonymous",
          },
        }
      );

      setOutput(data.output || "No output");
      if (data.error) {
        setError(data.error);
      }
    } catch (error) {
      console.error("❌ Error executing code:", error);
      setError(
        "Failed to execute code. Please check your syntax or try again later."
      );
      setOutput("");
    } finally {
      setIsRunning(false);
    }
  };

  // 🟢 Submit Answer (Validates & Evaluates)
  const submitAnswer = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setOutput("Evaluating your solution...");
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No authentication token found!");
        return;
      }

      const { data } = await axios.post(
        `${apiBaseUrl}/interview/validate`,
        {
          code,
          languageId,
          testCases,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "user-id": localStorage.getItem("userId") || "anonymous",
          },
        }
      );

      setTestResults(data.outputs || []);
      setOutput("Submission successful! Moving to next question...");

      // Short delay before moving to next question
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        fetchNextQuestion();
      }, 2000);
    } catch (error) {
      console.error("❌ Error submitting answer:", error);
      setError("Failed to submit your answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🟢 Finish Interview & Show Final Score
  const finishInterview = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No authentication token found!");
        return;
      }

      setIsLoading(true);
      const { data } = await axios.post(
        `${apiBaseUrl}/interview/finish`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "user-id": localStorage.getItem("userId") || "anonymous",
          },
        }
      );

      setFinalScore(data.finalScore);
      setShowFinishDialog(false);
      setInterviewCompleted(true);

      // Clear any stored interview data
      localStorage.removeItem("interview_score");
      localStorage.removeItem("interview_id");
    } catch (error) {
      console.error("❌ Error finishing interview:", error);
      setError("Failed to complete the interview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguageId = Number(e.target.value);
    setLanguageId(newLanguageId);

    // Set default code for the selected language
    const selectedLanguage = languageOptions.find(
      (lang) => lang.id === newLanguageId
    );
    if (selectedLanguage) {
      setCode(selectedLanguage.defaultCode);
    }
  };

  return (
    <div className="min-h-screen bg-background text-primary p-6">
      <h2 className="text-center text-2xl font-bold text-primary mb-4">
        Coding Interview
      </h2>

      {/* Final Score Display */}
      {interviewCompleted && finalScore !== null && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
          <h3 className="text-xl font-bold text-center">
            Interview Completed!
          </h3>
          <p className="text-center text-lg mt-2">
            Your Final Score: {finalScore}%
          </p>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => navigate("/profile")}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition"
            >
              Return to Profile
            </button>
          </div>
        </div>
      )}

      {!interviewCompleted && (
        <>
          {/* Question Display */}
          <div className="bg-background2 text-primary p-4 rounded-lg mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">
                Question {currentQuestionIndex + 1} of {totalQuestions}:
              </h2>
              <span className="text-sm bg-primary text-white px-2 py-1 rounded">
                {languageOptions.find((lang) => lang.id === languageId)?.name ||
                  "Python"}
              </span>
            </div>

            {isLoading ? (
              <div className="text-text2 mt-4 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            ) : (
              <div className="text-text2 mt-2 whitespace-pre-line">
                {currentQuestion}
              </div>
            )}
          </div>

          {/* Language Selection */}
          <div className="flex justify-between items-center mt-4">
            <select
              className="p-2 bg-secondary text-white rounded-md"
              value={languageId}
              onChange={handleLanguageChange}
            >
              {languageOptions.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={runCode}
                disabled={isRunning}
                className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition ${
                  isRunning ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isRunning ? "Running..." : "Run Code"}
              </button>

              {!interviewCompleted && (
                <button
                  onClick={submitAnswer}
                  disabled={isSubmitting}
                  className={`bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Solution"}
                </button>
              )}
            </div>
          </div>

          {/* Code Editor */}
          <div className="mt-4 border-2 border-secondary rounded-lg">
            <Editor
              height="400px"
              language={
                languageId === 71
                  ? "python"
                  : languageId === 63
                    ? "javascript"
                    : languageId === 54
                      ? "cpp"
                      : languageId === 62
                        ? "java"
                        : "python"
              }
              value={code}
              theme="vs-dark"
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                automaticLayout: true,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                tabSize: 2,
              }}
            />
          </div>

          {/* Output Display */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Output:</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono whitespace-pre-wrap h-32 overflow-y-auto">
              {output || "Run your code to see output here"}
            </div>

            {error && (
              <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline whitespace-pre-wrap">
                  {error}
                </span>
              </div>
            )}
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-background2 rounded-lg">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Test Case</th>
                      <th className="px-4 py-2 text-left">Your Output</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.map((result, index) => {
                      const expectedOutput =
                        testCases[index]?.expected_output || "N/A";
                      const passed = result.trim() === expectedOutput.trim();

                      return (
                        <tr key={index} className="border-t border-gray-700">
                          <td className="px-4 py-2">
                            <div className="font-bold">Input:</div>
                            <div className="font-mono text-sm">
                              {testCases[index]?.input || "N/A"}
                            </div>
                            <div className="font-bold mt-1">Expected:</div>
                            <div className="font-mono text-sm">
                              {expectedOutput}
                            </div>
                          </td>
                          <td className="px-4 py-2 font-mono text-sm">
                            {result || "No output"}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded text-white ${passed ? "bg-green-600" : "bg-red-600"}`}
                            >
                              {passed ? "PASSED" : "FAILED"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Finish Interview Button */}
          {currentQuestionIndex + 1 >= totalQuestions && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowFinishDialog(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-800 transition text-lg"
              >
                Finish Interview
              </button>
            </div>
          )}
        </>
      )}

      {/* Finish Interview Confirmation Modal */}
      {showFinishDialog && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg text-center max-w-md">
            <h2 className="text-xl font-bold">Confirm Finish Interview?</h2>
            <p className="text-gray-700 mt-2">
              Are you sure you want to finish the interview? This action cannot
              be undone.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setShowFinishDialog(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={finishInterview}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-800 transition"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Finish Interview"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-40">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-700">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodingInterview;
