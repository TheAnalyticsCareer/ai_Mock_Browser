import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useVoiceAI } from "@/hooks/useVoiceAI";
import { generateFeedback, generateInterviewerQuestion } from "@/lib/gemini";
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import VideoSection from '@/components/interview/VideoSection';
import InterviewControls from '@/components/interview/InterviewControls';
import TranscriptPanel from '@/components/interview/TranscriptPanel';
import { ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input'; // Make sure you have this component
import { Button } from '@/components/ui/button'; // For the send button

const Interview = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { listening, transcript, startListening, stopListening, speak, resetTranscript, voices } = useVoiceAI();
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");

  const [conversation, setConversation] = useState<string[]>([]);
  const [aiThinking, setAiThinking] = useState(false);

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const [typedAnswer, setTypedAnswer] = useState(""); // <-- Add this state
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en'); // Add this state

  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  const role = location.state?.role || 'Software Developer';
  const roleDescription = location.state?.roleDescription || '';
  const interviewId = location.state?.interviewId || id;

  // Find the selected voice object, filtered by language
  const filteredVoices = voices.filter(v =>
    selectedLanguage === 'hi'
      ? v.lang.toLowerCase().includes('hi') // Hindi
      : v.lang.toLowerCase().includes('en') // English
  );
  const selectedVoice = filteredVoices.find(v => v.voiceURI === selectedVoiceURI) || filteredVoices[0];

  // Update useVoiceAI to use correct language for STT
  useEffect(() => {
    if (window && (window as any).SpeechRecognition) {
      const recognition = (window as any).recognitionRef?.current;
      if (recognition) {
        recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';
      }
    }
  }, [selectedLanguage]);

  useEffect(() => {
    console.log('Interview component mounted');
    console.log('Interview ID:', interviewId);
    console.log('Role:', role);
    
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [mediaStream, interviewId, role]);

  const createInterviewRecord = async () => {
    if (!interviewId || !user) return;
    
    try {
      const interviewData = {
        id: interviewId,
        userId: user.uid,
        candidateName: user.email || 'Anonymous',
        role: role,
        status: 'in_progress',
        startTime: new Date().toISOString(),
        transcript: '',
        duration: 0,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'interviews', interviewId), interviewData);
      console.log('Interview record created successfully');
    } catch (error) {
      console.error('Error creating interview record:', error);
    }
  };

  const handleStartInterview = async () => {
    if (!mediaStream) {
      toast({
        title: "Media Access Required",
        description: "Please allow camera and microphone access to start the interview",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await createInterviewRecord();
      setInterviewStartTime(new Date());
      setIsInterviewActive(true);
      setConnectionStatus('connected');
      setIsAISpeaking(true); // <-- fix here

      // Start duration timer
      durationInterval.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      toast({
        title: "Interview Started",
        description: `The AI interviewer for ${role} position should start speaking shortly.`,
      });

      // Use language in AI intro
      const aiIntro =
        selectedLanguage === 'hi'
          ? `नमस्ते, आपके ${role} इंटरव्यू सत्र में आपका स्वागत है। शुरू करने के लिए, कृपया अपना पूरा नाम बताएं।`
          : `Hello, and welcome to your ${role} interview session. To begin, could you please tell me your full name?`;
      setConversation([`AI: ${aiIntro}`]);
      speak(aiIntro, selectedVoice);
      setIsAISpeaking(false); // <-- fix here
    } catch (error) {
      console.error('Error starting interview:', error);
      toast({
        title: "Failed to Start Interview",
        description: "There was an error starting the interview. Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndInterview = async () => {
    setIsLoading(true);
    
    try {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }

      setIsInterviewActive(false);
      setConnectionStatus('disconnected');

      console.log('Interview ended. Transcript length:', transcript.length);
      console.log('Final transcript:', transcript);

      // Update interview status in database
      if (interviewId && user) {
        const finalTranscript = transcript.length > 0 ? transcript.join('\n') : 'No transcript available';
        
        await updateDoc(doc(db, 'interviews', interviewId), {
          status: 'completed',
          endTime: new Date().toISOString(),
          transcript: finalTranscript,
          duration: duration
        });
        
        console.log('Interview data saved to database');
      }

      toast({
        title: "Interview Completed",
        description: "Generating your feedback...",
      });

      // Navigate to feedback page with all necessary data
      navigate(`/feedback/${interviewId}`, {
        state: {
          transcript: conversation.join('\n'),
          role,
          duration,
          candidateName: user?.email || 'Candidate'
        }
      });
    } catch (error) {
      console.error('Error ending interview:', error);
      toast({
        title: "Error Ending Interview",
        description: "There was an issue ending the interview, but your data has been saved.",
        variant: "destructive",
      });
      
      // Still navigate to feedback even if there was an error
      navigate(`/feedback/${interviewId}`, {
        state: {
          transcript: transcript.length > 0 ? transcript.join('\n') : 'Interview completed with some technical issues',
          role,
          duration,
          candidateName: user?.email || 'Candidate'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // When transcript changes and listening has stopped, handle user answer
  useEffect(() => {
    if (!listening && transcript.trim()) {
      handleUserAnswer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, transcript]);

  const handleUserAnswer = async () => {
    if (!transcript.trim()) return;
    setConversation(prev => [...prev, `You: ${transcript}`]);
    setAiThinking(true);

    // Pass language to AI
    const aiQuestion = await generateInterviewerQuestion(
      [...conversation, `You: ${transcript}`].join('\n'),
      role,
      selectedLanguage
    );

    setConversation(prev => [...prev, `AI: ${aiQuestion}`]);
    speak(aiQuestion, selectedVoice, () => {
      setIsAISpeaking(false);
      startListening(); // Automatically start listening after AI finishes speaking
    });
    resetTranscript();
    setAiThinking(false);
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedAnswer.trim()) return;
    setConversation(prev => [...prev, `You: ${typedAnswer}`]);
    setAiThinking(true);

    const aiQuestion = await generateInterviewerQuestion(
      [...conversation, `You: ${typedAnswer}`].join('\n'),
      role,
      selectedLanguage
    );

    setConversation(prev => [...prev, `AI: ${aiQuestion}`]);
    speak(aiQuestion, selectedVoice, () => {
      setIsAISpeaking(false);
      startListening(); // Automatically start listening after AI finishes speaking
    });
    setTypedAnswer("");
    setAiThinking(false);
  };

  const toggleCamera = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isCameraOn;
        setIsCameraOn(!isCameraOn);
      }
    }
  };

  const toggleMic = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
        setIsMicOn(!isMicOn);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Example: After transcript is set, send to backend
  useEffect(() => {
    if (transcript) {
      // Call your AI backend here, then:
      // speak(aiResponse);
    }
  }, [transcript]);

  const INSTRUCTIONS = [
    "1. Make sure your camera and microphone are enabled.",
    "2. The AI interviewer will begin by asking for your name and background.",
    "3. Answer each question clearly. You can reply by voice or by typing.",
    "4. Wait for the AI to finish speaking before you answer.",
    "5. You can switch between English and Hindi before starting.",
    "6. Click 'End Interview' when you are done.",
    "7. After the interview, you will receive detailed AI feedback.",
    "8. If you face any issues, refresh the page and try again.",
  ];

 return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-[#15192c] via-[#232d4d] to-[#20202b] flex flex-col items-center justify-start transition-all duration-500">
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto mt-2 px-2 sm:px-4">
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
          <button
            className="rounded-full bg-black/30 hover:bg-black/50 p-2 transition-colors"
            onClick={() => window.history.back()}
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              AI Interview
              <Badge variant="secondary" className="ml-2 px-2 sm:px-4 py-1 text-sm sm:text-base rounded-lg tracking-widest">
                {role}
              </Badge>
            </h1>
            {roleDescription && (
              <p className="text-gray-400 text-sm sm:text-base ml-0 sm:ml-6">{roleDescription}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className="rounded-lg border border-gray-800 bg-gray-800/60 px-3 py-1 flex items-center gap-2 shadow-inner"
              title="Interview Duration"
            >
              <span className="font-mono text-lg text-white">{formatDuration(duration)}</span>
            </div>

            {isInterviewActive && (
              <div className="flex items-center gap-2 bg-red-700/60 px-2 py-1 rounded-lg animate-pulse border border-red-700 shadow-md">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wide text-red-100">Recording</span>
              </div>
            )}

            {isAISpeaking && (
              <div className="flex items-center gap-2 bg-green-700/60 px-2 py-1 rounded-lg border border-green-700 shadow-md">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wide text-green-100">AI Speaking</span>
              </div>
            )}
          </div>
        </div>
        {/* --- Language and Voice Selection Dropdowns --- */}
        <div className="mt-2 flex flex-col sm:flex-row gap-2">
          {/* --- Language Selection Dropdown --- */}
          <div className="flex items-center gap-2">
            <label htmlFor="language-select" className="text-white font-semibold">
              Interview Language:
            </label>
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value as 'en' | 'hi')}
              className="rounded px-2 py-1 bg-gray-800 text-white border border-gray-700"
              style={{ minWidth: 120 }}
              disabled={isInterviewActive}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>

          {/* --- Voice Selection Dropdown --- */}
          <div className="flex items-center gap-2">
            <label htmlFor="voice-select" className="text-white font-semibold">
              Select AI Voice:
            </label>
            <select
              id="voice-select"
              value={selectedVoiceURI}
              onChange={e => setSelectedVoiceURI(e.target.value)}
              className="rounded px-2 py-1 bg-gray-800 text-white border border-gray-700"
              style={{ minWidth: 200 }}
            >
              <option value="">Default</option>
              {voices.map(voice => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang}){voice.default ? " [Default]" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 mt-4 px-2 sm:px-4">
        {/* Video Section */}
        <div className="flex-[2.8] flex flex-col rounded-2xl bg-black/30 shadow-2xl backdrop-blur-lg border border-gray-800/50 overflow-hidden min-h-[340px] sm:min-h-[420px] md:min-h-[600px] max-h-[900px] transition-all duration-300">
          <VideoSection
            isCameraOn={isCameraOn}
            isAISpeaking={isAISpeaking}
            isInterviewActive={isInterviewActive}
            connectionStatus={connectionStatus}
            onStreamReady={setMediaStream}
          />

          <div className="border-t border-gray-700/60 bg-gradient-to-t from-gray-800/60 to-transparent w-full">
            <InterviewControls
              isCameraOn={isCameraOn}
              isMicOn={isMicOn}
              isInterviewActive={isInterviewActive}
              isLoading={isLoading}
              hasMediaStream={!!mediaStream}
              onToggleCamera={toggleCamera}
              onToggleMic={toggleMic}
              onStartInterview={handleStartInterview}
              onEndInterview={handleEndInterview}
            />
          </div>
        </div>

        {/* Transcript Panel */}
        <div className="w-full sm:w-[100%] md:w-[480px] lg:w-[520px] rounded-2xl shadow-2xl border border-gray-800/40 overflow-hidden bg-black/30 backdrop-blur-lg mt-4 lg:mt-0 flex flex-col min-h-[260px] md:min-h-[340px] max-h-[900px] transition-all duration-300">
          <TranscriptPanel transcript={conversation} isInterviewActive={isInterviewActive} />

          {/* --- Add input box for text answers below transcript --- */}
          <form
            onSubmit={handleTextSubmit}
            className="flex items-center gap-2 p-3 border-t border-gray-700 bg-gray-900"
          >
            <Input
              type="text"
              placeholder="Type your answer here..."
              value={typedAnswer}
              onChange={e => setTypedAnswer(e.target.value)}
              disabled={!isInterviewActive || aiThinking}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!typedAnswer.trim() || !isInterviewActive || aiThinking}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Send
            </Button>
            <Button
              type="button"
              onClick={startListening}
              disabled={listening || !isInterviewActive || aiThinking}
              className="bg-green-600 hover:bg-green-700"
            >
              {listening ? "Listening..." : "🎤"}
            </Button>
          </form>
        </div>

        {/* Instructions Panel - right side */}
        <div className="w-full sm:w-[98%] md:w-[320px] mt-4 lg:mt-0 flex flex-col">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow p-4 h-fit">
            <h2 className="text-lg font-bold text-yellow-800 mb-2">Interview Instructions</h2>
            <ul className="list-disc list-inside text-sm text-yellow-900 space-y-1 max-h-60 overflow-y-auto">
              {INSTRUCTIONS.map((inst, idx) => (
                <li key={idx}>{inst}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Background Animations */}
      <div className="fixed left-2 top-20 z-0 w-40 h-40 rounded-full bg-blue-700/20 blur-2xl animate-pulse pointer-events-none" />
      <div className="fixed right-2 bottom-8 z-0 w-56 h-32 rounded-full bg-pink-500/10 blur-2xl animate-[pulse_7s_ease-in-out_infinite]" />
    </div>
  );
};

export default Interview;

const speak = (text: string, selectedVoice?: SpeechSynthesisVoice, onEnd?: () => void) => {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    window.speechSynthesis.speak(utterance);

    if (onEnd) {
      utterance.onend = onEnd;
    }
  }
};
