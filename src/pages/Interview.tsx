import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import TextToSpeech from "../components/TextToSpeech";
import jsPDF from "jspdf";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import { Mic, StopCircle } from "lucide-react";
import Lottie from "lottie-react";
import LoadingAnimation2 from "../icons/Loading_Animation2.json";

const Interview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [transcript, setTranscript] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [interviewData, setInterviewData] = useState<any>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [summaries, setSummaries] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const pdf = useRef(new jsPDF());
  const [y, setY] = useState(20); // Initial y position for PDF
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const extraTime = useRef(120); // 2 minutes in seconds
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isQuestionReady, setIsQuestionReady] = useState(false);

  useEffect(() => {
    fetchInterviewDetails();
  }, [id]);

  useEffect(() => {
    if (interviewData && interviewData.duration) {
      setTimeLeft(parseInt(interviewData.duration, 10) * 60);
    }
  }, [interviewData]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !isTimeUp) {
      timerInterval.current = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime !== null ? prevTime - 1 : null));
      }, 1000);
    } else if (timeLeft === 0 && !isTimeUp) {
      setIsTimeUp(true);
      setTimeLeft(extraTime.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
      timerInterval.current = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime !== null ? prevTime - 1 : null));
      }, 1000);
    } else if (timeLeft !== null && timeLeft < 0 && isTimeUp) {
      if (timerInterval.current) clearInterval(timerInterval.current);
      showCompletionDialog();
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [timeLeft, isTimeUp]);

  const fetchInterviewDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://localhost:5000/api/interview/current/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Interview Details:", data);
      setInterviewData(data);
      generateQuestions(
        data.post,
        data.difficulty,
        data.additional_notes,
        data.duration
      );
    } catch (error) {
      console.error("❌ Error fetching interview details:", error);
    }
  };

  const generateQuestions = async (
    post: string,
    difficulty: string,
    additional_notes: string,
    duration: string
  ) => {
    const token = localStorage.getItem("token");
    let attempts = 3; // Retry up to 3 times
    let delay = 2000; // Initial delay of 2 seconds

    for (let i = 0; i < attempts; i++) {
      try {
        console.log(`🔄 Attempt ${i + 1} to generate questions...`);

        const { data } = await axios.post(
          `http://localhost:5000/api/interview/generate-questions`,
          { post, difficulty, additional_notes, duration },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("✅ Generated Questions:", data.questions);
        setQuestions(data.questions);
        setIsQuestionReady(true);
        return; // Exit function on success
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn(`⚠️ Rate limit hit. Retrying in ${delay / 1000}s...`);
          await new Promise((res) => setTimeout(res, delay)); // Wait before retrying
          delay *= 2; // Increase delay exponentially
        } else {
          console.error("❌ Error generating questions:", error);
          return;
        }
      }
    }

    console.error("❌ Failed to generate questions after multiple attempts.");
  };
  const evaluateAnswer = async (question: string, answer: string) => {
    try {
      // If answer is too short, provide a local evaluation
      if (answer.trim().length < 15) {
        console.log("Answer too short, providing local evaluation");
        return {
          score: 10,
          summary:
            "Your answer was too brief to be properly evaluated. Consider providing more details in your responses.",
        };
      }

      const token = localStorage.getItem("token");
      console.log("Sending for evaluation:", { question, answer });

      const { data } = await axios.post(
        `http://localhost:5000/api/interview/evaluate`,
        { question, answer },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Evaluation Response:", data);

      // Ensure we have valid data
      if (!data || (typeof data.score !== "number" && !data.summary)) {
        throw new Error("Invalid evaluation response format");
      }

      return {
        score: data.score || 0,
        summary: data.summary || "No summary provided",
        breakdown: data.breakdown || null,
      };
    } catch (error) {
      console.error("❌ Error evaluating response:", error);

      // Provide a more meaningful fallback evaluation
      const wordCount = answer.split(/\s+/).length;
      let fallbackScore = 0;
      let fallbackSummary = "";

      if (wordCount < 10) {
        fallbackScore = 10;
        fallbackSummary =
          "Your answer was very brief. Consider providing more details and examples in your responses.";
      } else if (wordCount < 30) {
        fallbackScore = 30;
        fallbackSummary =
          "Your answer had moderate length but may have lacked depth or specificity. Try to include more concrete examples and technical details.";
      } else {
        fallbackScore = 50;
        fallbackSummary =
          "Your answer had good length but could not be evaluated for technical accuracy. The evaluation system encountered an issue processing your response.";
      }

      return {
        score: fallbackScore,
        summary: fallbackSummary,
      };
    }
  };

  const startRecording = async () => {
    if (isTimeUp) return;
    try {
      setIsRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
      if (!apiKey) {
        console.error("❌ Deepgram API Key is missing! Check .env file.");
        return;
      }
      const socket = new WebSocket(
        `wss://api.deepgram.com/v1/listen?model=nova-2&language=en-IN&punctuate=true&smart_format=true`,
        ["token", apiKey]
      );

      socket.onopen = () => {
        console.log("✅ Deepgram WebSocket Connected");
        mediaRecorder.start(250);
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        }
      };

      socket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        if (data.type === "Results") {
          const transcription = data.channel?.alternatives[0]?.transcript || "";
          if (transcription) {
            setTranscript((prev) => prev + " " + transcription);
          }
        }
      };

      socket.onclose = () => {
        console.log("⚠️ Deepgram WebSocket Closed");
      };

      socket.onerror = (error) => {
        console.error("❌ Deepgram WebSocket Error:", error);
      };

      socketRef.current = socket;
    } catch (error) {
      console.error("❌ Error starting recording:", error);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream
      .getTracks()
      .forEach((track) => track.stop());
    socketRef.current?.close();
    console.log("🛑 Recording Stopped & WebSocket Closed");
    await processAnswer();
  };

  const processAnswer = async () => {
    setIsProcessing(true);
    const answerToEvaluate = transcript;
    const evaluation = await evaluateAnswer(
      questions[currentQuestion],
      answerToEvaluate
    );
    setScores((prev) => [...prev, evaluation.score]);
    setSummaries((prev) => [...prev, evaluation.summary]);

    saveAnswerToPDF(evaluation.score, evaluation.summary, answerToEvaluate);

    setTranscript("");
    setIsProcessing(false);

    if (currentQuestion + 1 < questions.length && !isTimeUp) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      showCompletionDialog();
    }
  };

  const showCompletionDialog = () => {
    setIsCompleteDialogOpen(true);
  };

  const completeInterview = () => {
    savePDF();
    setIsCompleteDialogOpen(false);
    navigate("/"); // Navigate to home page
  };

  const saveAnswerToPDF = (score: number, summary: string, answer: string) => {
    const doc = pdf.current;
    const margin = 20;
    const pageWidth = 210 - margin * 2;
    const pageHeight = 297 - margin * 2;
    const lineHeight = 8;
    let currentY = y;

    if (currentQuestion === 0) {
      doc.setFontSize(18);
      doc.text("Interview Report", margin, currentY);
      currentY += lineHeight + 5;

      doc.setFontSize(12);
      if (interviewData) {
        const details = [
          `Interview ID: ${interviewData._id}`,
          `Title: ${interviewData.title}`,
          `Position: ${interviewData.post}`,
          `Difficulty: ${interviewData.difficulty}`,
          `Date: ${new Date(interviewData.date).toLocaleDateString()}`,
          `Time: ${interviewData.time}`,
          `Duration: ${interviewData.duration} minutes`,
          `Additional Notes: ${interviewData.additional_notes || "None"}`,
        ];

        details.forEach((text) => {
          if (currentY + lineHeight > pageHeight) {
            doc.addPage();
            currentY = margin;
          }
          doc.text(text, margin, currentY);
          currentY += lineHeight;
        });

        doc.text(
          "------------------------------------------------------------",
          margin,
          currentY
        );
        currentY += lineHeight + 5;
      }
    }
    setY(currentY);

    doc.setFontSize(12);
    const questionText = `Q${currentQuestion + 1}: ${questions[currentQuestion]}`;
    const answerText = `A: ${answer}`;
    const evalText = `Evaluation: Score - ${score}/100 | Summary: ${summary || "No summary available"}`;

    [questionText, answerText, evalText].forEach((text) => {
      const splitText = doc.splitTextToSize(text, pageWidth);
      if (currentY + splitText.length * lineHeight > pageHeight) {
        doc.addPage();
        currentY = margin;
      }
      doc.text(splitText, margin, currentY);
      currentY += splitText.length * lineHeight + 5;
    });
    setY(currentY);
  };

  const savePDF = () => {
    const totalScore = scores.reduce((sum, s) => sum + s, 0);
    const doc = pdf.current;

    if (y + 15 > 297 - 20) {
      doc.addPage();
      setY(20);
    }

    doc.setFontSize(14);
    doc.text(
      `Final Interview Score: ${totalScore}/${questions.length * 100}`,
      20,
      y
    );
    doc.save(`Interview_Report_${id}.pdf`);
  };

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "Loading...";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  const progress =
    questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Interview Session</h1>
        <div className="text-lg font-semibold">{formatTime(timeLeft)}</div>
      </div>
      <Card className="w-full max-w-2xl mx-auto">
        <div className="p-6">
          {interviewData && (
            <p className="text-gray-600 mb-2">Position: {interviewData.post}</p>
          )}
          <p className="text-gray-500 mb-4">Interview ID: {id}</p>
          {questions.length > 0 && isQuestionReady && (
            <>
              <Progress value={progress} className="mb-4" />
              <h2 className="text-lg font-medium mb-2">
                Question {currentQuestion + 1}/{questions.length}
              </h2>
              <p className="mb-4">{questions[currentQuestion]}</p>
              <TextToSpeech
                text={questions[currentQuestion]}
                onComplete={startRecording}
              />
              <div className="flex items-center space-x-2 mt-4">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={questions.length === 0 || isTimeUp || isProcessing}
                >
                  {isRecording ? (
                    <>
                      <StopCircle className="mr-2 h-4 w-4 text-white" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4 text-white" />
                      Start Listening
                    </>
                  )}
                </Button>
                {isTimeUp && (
                  <span className="text-red-500 font-semibold">
                    Extra time!
                  </span>
                )}
                {isProcessing && (
                  <span className="text-blue-500 font-semibold">
                    Processing your answer...
                  </span>
                )}
              </div>
              {transcript && (
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <p className="text-sm text-gray-700">
                    <strong>Your Response:</strong>
                  </p>
                  <p className="text-gray-800">{transcript}</p>
                </div>
              )}
            </>
          )}
          {(questions.length === 0 || !isQuestionReady) && interviewData && (
            <div className="bg-white rounded-lg flex flex-col items-center">
              <p className="text-center text-gray-600">
                Generating questions... please wait.
              </p>
              <Lottie
                animationData={LoadingAnimation2}
                loop={true}
                style={{ width: 200, height: 200 }}
                initialSegment={[0, 45]}
              />
            </div>
          )}
          {questions.length === 0 && !interviewData && (
            <p className="text-center text-red-500">
              Error fetching interview details.
            </p>
          )}
        </div>
      </Card>
      {/* Interview Completion Modal */}
      {isCompleteDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96 max-w-md">
            <h3 className="text-xl font-semibold text-green-600 mb-4">
              🎉 Interview Completed!
            </h3>
            <p className="text-gray-700 mb-3">
              Your interview has been completed successfully. Your responses
              have been recorded and evaluated.
            </p>
            <p className="text-gray-700 mb-4">
              A PDF report has been generated with your interview details,
              questions, answers, and evaluations.
            </p>
            {scores.length > 0 && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <p className="font-medium">
                  Final Score: {scores.reduce((sum, score) => sum + score, 0)}/
                  {questions.length * 100}
                </p>
              </div>
            )}
            <button
              onClick={completeInterview}
              className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-blue-500"
            >
              Download Report & Return Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interview;
