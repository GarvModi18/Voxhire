import React, { useState } from "react";
import VoskSpeech from "../components/VoskSpeech";
import Recorder from "../components/Recorder";
import { sendToGemini } from "../api/geminiAPI";

const Interview: React.FC = () => {
  const [question, setQuestion] = useState<string>("");
  const [candidateResponse, setCandidateResponse] = useState<string>("");

  const handleNewQuestion = (q: string) => setQuestion(q);

  const handleResponse = async (response: string) => {
    setCandidateResponse(response);
    const evaluation = await sendToGemini(question, response);
    console.log("Evaluation:", evaluation);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🎙️ AI Interview</h1>

      {/* Vosk Model Speech Input */}
      <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
        <VoskSpeech onQuestionGenerated={handleNewQuestion} />
      </div>

      {/* Display Question */}
      <div className="w-full max-w-2xl bg-gray-700 p-4 mt-4 rounded-md text-lg">
        <p>
          <span className="font-semibold text-blue-400">Question:</span>{" "}
          {question || "Waiting for a question..."}
        </p>
      </div>

      {/* Recorder */}
      <div className="w-full max-w-2xl bg-gray-800 p-6 mt-4 rounded-lg shadow-md border border-gray-700">
        <Recorder onStop={handleResponse} />
      </div>

      {/* Display Response */}
      <div className="w-full max-w-2xl bg-gray-700 p-4 mt-4 rounded-md text-lg">
        <p>
          <span className="font-semibold text-green-400">Your Answer:</span>{" "}
          {candidateResponse || "Waiting for your response..."}
        </p>
      </div>
    </div>
  );
};

export default Interview;
