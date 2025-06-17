
import { useRef, useEffect, useState } from 'react';
import { User } from 'lucide-react';

interface VideoSectionProps {
  isCameraOn: boolean;
  isAISpeaking: boolean;
  isInterviewActive: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  onStreamReady: (stream: MediaStream | null) => void;
}

const VideoSection = ({ 
  isCameraOn, 
  isAISpeaking, 
  isInterviewActive, 
  connectionStatus,
  onStreamReady 
}: VideoSectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    initializeCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      console.log('Requesting camera and microphone access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setStream(mediaStream);
      onStreamReady(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      console.log('Camera and microphone access granted');
    } catch (error) {
      console.error('Error accessing camera:', error);
      onStreamReady(null);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected to AI';
      case 'connecting': return 'Connecting...';
      default: return 'Disconnected';
    }
  };

  return (
    <div className="flex-1 bg-gray-800 relative">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      
      {!isCameraOn && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <User className="h-24 w-24 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">Camera is off</p>
          </div>
        </div>
      )}

      {/* AI Interviewer Placeholder */}
      <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg border-2 border-gray-600 flex items-center justify-center">
        <div className="text-center">
        <img
                src="https://d502jbuhuh9wk.cloudfront.net/logos/6677da88a7c70751b1bf34a8.png?v=1"
                alt="Logo"
                className="h-12 w-15 object-contain align-middle mx-auto mb-2"
              />
          <p className="text-l text-gray-300">AI Interviewer</p>
          {isAISpeaking && (
            <div className="mt-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mx-auto"></div>
              <p className="text-xs text-green-400 mt-1">Speaking...</p>
            </div>
          )}
          {isInterviewActive && !isAISpeaking && (
            <div className="mt-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto"></div>
              <p className="text-xs text-blue-400 mt-1">Listening...</p>
            </div>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded-lg p-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor()} ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}`}></div>
          <span className="text-xs text-white">{getConnectionStatusText()}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoSection;

