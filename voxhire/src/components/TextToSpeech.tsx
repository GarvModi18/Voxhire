import React, { useEffect } from "react";

const TextToSpeech: React.FC<{ text: string; onComplete: () => void }> = ({
  text,
  onComplete,
}) => {
  useEffect(() => {
    if (text && !speechSynthesis.speaking) {
      console.log("🔊 Speaking:", text);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice =
        speechSynthesis.getVoices().find((voice) => voice.lang === "en-IN") ||
        speechSynthesis.getVoices()[0];

      utterance.rate = 0.9;
      utterance.pitch = 1.1;

      utterance.onend = () => {
        console.log("✅ Speech finished, now starting STT...");
        onComplete(); // ✅ Start STT after TTS completes
      };

      speechSynthesis.speak(utterance);
    }
  }, [text]);

  return null;
};

export default TextToSpeech;
