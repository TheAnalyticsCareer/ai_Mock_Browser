import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useVapi } from '@/hooks/useVapi';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import VideoSection from '@/components/interview/VideoSection';
import InterviewControls from '@/components/interview/InterviewControls';
import TranscriptPanel from '@/components/interview/TranscriptPanel';
import { ChevronLeft } from 'lucide-react';

const Interview = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  const role = location.state?.role || 'Software Developer';
  const roleDescription = location.state?.roleDescription || '';
  const interviewId = location.state?.interviewId || id;

  const {
    isInterviewActive,
    isAISpeaking,
    connectionStatus,
    transcript,
    handleStartInterview: vapiStartInterview,
    handleStopInterview: vapiStopInterview,
  } = useVapi();

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
      console.log('Creating interview record and starting Vapi for role:', role);
      
      // Create interview record first
      await createInterviewRecord();
      
      // Start the Vapi interview with role information
      const success = await vapiStartInterview(role, roleDescription);
      
      if (success) {
        setInterviewStartTime(new Date());
        
        // Start duration timer
        durationInterval.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
        
        toast({
          title: "Interview Started",
          description: `The AI interviewer for ${role} position should start speaking shortly.`,
        });

        // Check if AI starts speaking within 10 seconds
        setTimeout(() => {
          console.log('Checking if AI is speaking...', { isAISpeaking, connectionStatus });
          if (connectionStatus === 'connected' && !isAISpeaking) {
            toast({
              title: "AI Interviewer Ready",
              description: `The AI interviewer for ${role} is connected. You can start speaking to begin the conversation.`,
            });
          }
        }, 5000);
        
      } else {
        throw new Error('Failed to start Vapi interview');
      }
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
      const success = await vapiStopInterview();
      
      if (success || true) { // Always proceed even if stop fails
        if (durationInterval.current) {
          clearInterval(durationInterval.current);
        }

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
            transcript: transcript.length > 0 ? transcript.join('\n') : 'Interview completed successfully',
            role,
            duration,
            candidateName: user?.email || 'Candidate'
          }
        });
      } else {
        throw new Error('Failed to stop interview properly');
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#15192c] via-[#232d4d] to-[#20202b] flex flex-col items-center justify-center transition-all duration-500">
      {/* Modern Header */}
      <div className="w-full max-w-6xl mx-auto mt-8 px-4">
        <div className="flex justify-between items-center gap-4">
          <button
            className="rounded-full bg-black/30 hover:bg-black/50 p-2 transition-colors"
            onClick={() => window.history.back()}
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              AI Interview
              <Badge variant="secondary" className="ml-2 px-4 py-1 text-base rounded-lg tracking-widest">
                {role}
              </Badge>
            </h1>
            {roleDescription && (
              <p className="hidden md:block text-gray-400 ml-6 text-base">
                {roleDescription}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
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
      </div>

      {/* Main Panels */}
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-6 mt-8 px-4 md:px-0">
        {/* Video Area */}
        <div className="flex-1 flex flex-col rounded-2xl bg-black/30 shadow-xl backdrop-blur-lg border border-gray-800/50 overflow-hidden min-h-[520px]">
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
        <div className="w-full md:w-[380px] rounded-2xl shadow-xl border border-gray-800/40 overflow-hidden bg-black/30 backdrop-blur-lg">
          <TranscriptPanel transcript={transcript} isInterviewActive={isInterviewActive} />
        </div>
      </div>
      {/* Subtle animated background shapes for flair */}
      <div className="fixed left-8 top-40 z-0 w-60 h-60 rounded-full bg-blue-700/20 blur-2xl animate-pulse pointer-events-none" />
      <div className="fixed right-12 bottom-14 z-0 w-72 h-40 rounded-full bg-pink-500/10 blur-2xl animate-[pulse_7s_ease-in-out_infinite]" />
    </div>
  );
};

export default Interview;
