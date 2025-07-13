import { useEffect, useState } from "react";

type UseVoiceAIResult = {
  listening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  speak: (
    text: string,
    selectedVoice?: SpeechSynthesisVoice,
    onEnd?: () => void
  ) => void;
  resetTranscript: () => void;
  voices: SpeechSynthesisVoice[];
  setLanguage: (lang: string) => void;
};

export function useVoiceAI(): UseVoiceAIResult {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [language, setLanguage] = useState("en-US");
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in your browser.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = language;

    recog.onstart = () => setListening(true);
    recog.onend = () => setListening(false);
    recog.onerror = () => setListening(false);

    recog.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
    };

    recog.start();
    setRecognition(recog);
  };

  const stopListening = () => {
    recognition?.stop();
    setListening(false);
  };

  const resetTranscript = () => setTranscript("");

  const speak = (
    text: string,
    selectedVoice?: SpeechSynthesisVoice,
    onEnd?: () => void
  ) => {
    if (!("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedVoice?.lang || language;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    if (onEnd) {
      utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  };

  return {
    listening,
    transcript,
    startListening,
    stopListening,
    speak,
    resetTranscript,
    voices,
    setLanguage,
  };
}
