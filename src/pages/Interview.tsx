// Interview.tsx (updated responsive and dropdown fix version with timer)
import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useVoiceAI } from '@/hooks/useVoiceAI';
import { generateInterviewerQuestion } from '@/lib/gemini';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import VideoSection from '@/components/interview/VideoSection';
import InterviewControls from '@/components/interview/InterviewControls';
import TranscriptPanel from '@/components/interview/TranscriptPanel';
import { ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { stopInterview } from '@/lib/vapi';

const Interview = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    listening,
    transcript,
    startListening,
    stopListening,
    speak,
    resetTranscript,
    voices,
    setLanguage
  } = useVoiceAI();

  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');
  const [conversation, setConversation] = useState<string[]>([]);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiQuestionStream, setAiQuestionStream] = useState<string>("");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [selectedTechStacks, setSelectedTechStacks] = useState<string[]>([]);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [duration, setDuration] = useState(0);
  const [remainingTime, setRemainingTime] = useState<number | null>(null); // State for the timer (in seconds)
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const role = location.state?.role || 'Software Developer';
  const roleDescription = location.state?.roleDescription || '';
  const interviewId = location.state?.interviewId || id;

  const filteredVoices = voices.filter(v =>
    selectedLanguage === 'hi' ? v.lang.toLowerCase().includes('hi') : v.lang.toLowerCase().includes('en')
  );
  const selectedVoice = filteredVoices.find(v => v.voiceURI === selectedVoiceURI) || filteredVoices[0];

  useEffect(() => {
    setLanguage(selectedLanguage === 'hi' ? 'hi-IN' : 'en-US');
  }, [selectedLanguage]);

  useEffect(() => {
    return () => {
      if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
      if (durationInterval.current) clearInterval(durationInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
      window.speechSynthesis.cancel();
      stopListening();
      stopInterview();
    };
  }, []);

  const createInterviewRecord = async () => {
    if (!interviewId || !user) return;
    const interviewData = {
      id: interviewId,
      userId: user.uid,
      candidateName: user.email || 'Anonymous',
      role,
      status: 'in_progress',
      startTime: new Date().toISOString(),
      transcript: '',
      duration: 0,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'interviews', interviewId), interviewData);
  };

  const handleStartInterview = async () => {
    if (!mediaStream) {
      toast({
        title: "Media Access Required",
        description: "Allow camera and mic to begin interview",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    setRemainingTime(15 * 60); // Initialize timer to 15 minutes (in seconds)
    try {
      await createInterviewRecord();
      setIsInterviewActive(true);
      setConnectionStatus('connected');
      setDuration(0);
      durationInterval.current = setInterval(() => setDuration(prev => prev + 1), 1000); // Update duration every second

      timerInterval.current = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime !== null && prevTime > 0) {
            return prevTime - 1;
          } else if (prevTime === 0) {
            handleEndInterview();
            return 0;
          }
          return prevTime;
        });
      }, 1000);

      toast({ title: "Interview Started", description: `AI for ${role} will start soon.` });

      const intro = selectedLanguage === 'hi'
        ? `नमस्ते, आपके ${role} इंटरव्यू सत्र में आपका स्वागत है। कृपया अपना नाम बताएं।`
        : `Hello, welcome to your ${role} interview. Please tell me your name.`;
      setConversation([` ${intro}`]);
      speak(intro, selectedVoice, () => {
        setIsAISpeaking(false);
        startListening();
      });
      setIsAISpeaking(true);
    } catch (e) {
      toast({ title: "Error Starting Interview", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndInterview = async () => {
    stopListening();
    window.speechSynthesis.cancel();
    if (durationInterval.current) clearInterval(durationInterval.current);
    if (timerInterval.current) clearInterval(timerInterval.current);
    setIsInterviewActive(false);
    setConnectionStatus('disconnected');
    setRemainingTime(null);

    if (interviewId && user) {
      await updateDoc(doc(db, 'interviews', interviewId), {
        status: 'completed',
        endTime: new Date().toISOString(),
        transcript: conversation.join('\n'),
        duration
      });
    }

    navigate(`/feedback/${interviewId}`, {
      state: {
        transcript: conversation.join('\n'),
        role,
        duration,
        candidateName: user?.email || 'Candidate'
      }
    });
  };

  useEffect(() => {
    if (!listening && transcript.trim()) handleUserAnswer();
  }, [listening, transcript]);

  const handleUserAnswer = async () => {
    if (!transcript.trim()) return;
    setConversation(prev => [...prev, `You: ${transcript}`]);
    setAiThinking(true);
    setAiQuestionStream("");
    let fullQuestion = "";
    let firstTokenReceived = false;
    const timeout = setTimeout(() => {
      if (!firstTokenReceived) setAiQuestionStream("...");
    }, 300);
    await generateInterviewerQuestion(
      [...conversation, `You: ${transcript}`].join('\n'),
      role,
      selectedLanguage,
      selectedTechStacks,
      (token) => {
        if (!firstTokenReceived) {
          firstTokenReceived = true;
          clearTimeout(timeout);
        }
        fullQuestion += token;
        setAiQuestionStream(fullQuestion);
      }
    );
    clearTimeout(timeout);
    setConversation(prev => [...prev, `AI: ${fullQuestion.trim()}`]);
    speak(fullQuestion.trim(), selectedVoice, () => {
      setIsAISpeaking(false);
      startListening();
    });
    resetTranscript();
    setAiQuestionStream("");
    setAiThinking(false);
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedAnswer.trim()) return;
    setConversation(prev => [...prev, `You: ${typedAnswer}`]);
    setAiThinking(true);
    setAiQuestionStream("");
    let fullQuestion = "";
    let firstTokenReceived = false;
    const timeout = setTimeout(() => {
      if (!firstTokenReceived) setAiQuestionStream("...");
    }, 300);
    await generateInterviewerQuestion(
      [...conversation, `You: ${typedAnswer}`].join('\n'),
      role,
      selectedLanguage,
      selectedTechStacks,
      (token) => {
        if (!firstTokenReceived) {
          firstTokenReceived = true;
          clearTimeout(timeout);
        }
        fullQuestion += token;
        setAiQuestionStream(fullQuestion);
      }
    );
    clearTimeout(timeout);
    setConversation(prev => [...prev, `AI: ${fullQuestion.trim()}`]);
    speak(fullQuestion.trim(), selectedVoice, () => {
      setIsAISpeaking(false);
      startListening();
    });
    setTypedAnswer("");
    setAiQuestionStream("");
    setAiThinking(false);
  };

 const INSTRUCTIONS = [
  "Please ensure your camera and microphone are enabled before starting.",
  "You will have 15 minutes for this interview.",
  "The interview will automatically end when the timer runs out.",
  "You may respond either by speaking or typing your answers.",
  "Wait for the AI to complete its question before responding.",
  "Select your preferred language prior to starting the interview.",
  "Click 'End Interview' once you are finished or before if needed.",
  "Personalized feedback will be generated after the session.",
  "Choose a quiet, distraction-free environment for optimal performance.",
  "Speak clearly and maintain a moderate pace during your responses.",
  "Do not refresh or close the browser tab during the interview.",
  "Keep your face clearly visible to the camera throughout the session.",
  "A stable internet connection is recommended to avoid interruptions.",
  "If your microphone is not functioning, you may switch to text input.",
];

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '15:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#15192c] via-[#232d4d] to-[#20202b] flex flex-col items-center overflow-hidden">
      <div className="w-full px-2 sm:px-4 mt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <button className="rounded-full bg-black/30 p-2" onClick={() => window.history.back()}>
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <div className="text-lg sm:text-xl text-red-500 font-bold flex-1">
            AI Interview <Badge className="ml-2">{role}</Badge>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
            {isInterviewActive && remainingTime !== null && (
              <Badge className="bg-blue-500 text-white">Time Left: {formatTime(remainingTime)}</Badge>
            )}
            <select
              value={selectedLanguage}
              onChange={(e) => {
                const lang = e.target.value as 'en' | 'hi';
                setSelectedLanguage(lang);
                setLanguage(lang === 'hi' ? 'hi-IN' : 'en-US');
              }}
              disabled={isInterviewActive}
              className="bg-gray-800 text-white border px-2 py-1 rounded text-sm max-w-[120px]"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>

            <select
              value={selectedVoiceURI}
              onChange={e => setSelectedVoiceURI(e.target.value)}
              className="bg-gray-800 text-white border px-2 py-1 rounded text-sm max-w-[150px] truncate"
            >
              <option value="">Default</option>
              {filteredVoices.map(v => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row flex-wrap gap-6 mt-4 px-2 sm:px-4">
        <div className="w-full lg:flex-[2.8] flex flex-col rounded-2xl bg-black/30 overflow-hidden min-h-[340px]">
          {roleDescription && (
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg shadow p-4 mb-2 text-blue-900 text-sm">
              <span className="font-semibold">Techstack :</span> {roleDescription}
            </div>
          )}

          <VideoSection
            isCameraOn={isCameraOn}
            isAISpeaking={isAISpeaking}
            isInterviewActive={isInterviewActive}
            connectionStatus={connectionStatus}
            onStreamReady={setMediaStream}
          />

          <InterviewControls
            isCameraOn={isCameraOn}
            isMicOn={isMicOn}
            isInterviewActive={isInterviewActive}
            isLoading={isLoading}
            hasMediaStream={!!mediaStream}
            onToggleCamera={() => setIsCameraOn(p => !p)}
            onToggleMic={() => setIsMicOn(p => !p)}
            onStartInterview={handleStartInterview}
            onEndInterview={handleEndInterview}
          />

          <form onSubmit={handleTextSubmit} className="flex flex-col sm:flex-row gap-2 p-3 border-t border-gray-700 bg-gray-900">
            <Input
              type="text"
              placeholder="Type your answer..."
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              disabled={!isInterviewActive || aiThinking}
              className="flex-1"
            />
            <Button type="submit" disabled={!typedAnswer.trim() || !isInterviewActive || aiThinking}>
              Send
            </Button>
            <Button type="button" onClick={startListening} disabled={listening || !isInterviewActive || aiThinking}>
              {listening ? "Listening..." : "Click to Speak"}
            </Button>
          </form>
        </div>

        <div className="w-full md:w-[480px] lg:w-[400px] rounded-2xl bg-black/30">
          <TranscriptPanel transcript={aiQuestionStream ? [...conversation, `AI: ${aiQuestionStream}`] : conversation} isInterviewActive={isInterviewActive} />
        </div>

        <div className="w-full lg:w-[300px] mt-4 lg:mt-0 flex flex-col">
          <div className="bg-yellow-50 border-l-4 border-red-400 rounded-lg shadow p-4">
            <h2 className="text-base sm:text-lg font-bold text-red-800 mb-2">Interview Instructions</h2>
            <ul className="list-disc list-inside text-sm text-red-900 space-y-1">
              {INSTRUCTIONS.map((inst, idx) => (
                <li key={idx}>{inst}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;