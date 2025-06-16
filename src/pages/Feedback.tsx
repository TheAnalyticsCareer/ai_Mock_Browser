import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateFeedback } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Clock, 
  User, 
  Briefcase,
  Home,
  ChevronLeft,
  RefreshCw,
  Calendar,
  Target,
  MessageSquare
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FeedbackData {
  overallRating: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  technicalSkills: string;
  communicationSkills: string;
  recommendations: string;
  interviewInsights?: string;
  nextSteps?: string;
}

const Feedback = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [interviewData, setInterviewData] = useState<any>(null);

  const transcript = location.state?.transcript || '';
  const role = location.state?.role || 'Software Developer';
  const duration = location.state?.duration || 0;
  const candidateName = location.state?.candidateName || 'Candidate';

  // --- Add transcript splitting logic ---
  // The transcript, as stored in the DB/location, may be a string or array.
  // We'll support both, but prefer array. If it's a string, split by newlines and remove empties.
  const getTranscriptArray = () => {
    if (Array.isArray(transcript)) return transcript;
    if (typeof transcript === "string") {
      // Split on line breaks or numbered lists
      return transcript
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);
    }
    return [];
  };

  useEffect(() => {
    if (id) {
      loadFeedback();
    }
  }, [id]);

  const generateNewFeedback = async (transcriptData: string, roleData: string, candidateNameData: string) => {
    console.log('Generating comprehensive AI feedback with data:', { 
      transcriptLength: transcriptData?.length || 0, 
      role: roleData, 
      candidateName: candidateNameData 
    });
    
    if (!transcriptData || transcriptData.trim().length === 0) {
      throw new Error('No interview transcript available for AI analysis. Please ensure the interview was properly recorded.');
    }
    
    try {
      const feedbackData = await generateFeedback(transcriptData, roleData, candidateNameData);
      console.log('Comprehensive AI feedback generated successfully:', feedbackData);
      return feedbackData;
    } catch (error) {
      console.error('AI feedback generation failed:', error);
      throw error;
    }
  };

  const loadFeedback = async () => {
    try {
      setLoading(true);
      
      if (!id) {
        throw new Error('No interview ID provided');
      }

      // Get interview data from database
      const interviewDoc = await getDoc(doc(db, 'interviews', id));
      
      if (interviewDoc.exists()) {
        const data = interviewDoc.data();
        setInterviewData(data);
        console.log('Interview data loaded:', data);
        
        // Always regenerate feedback to ensure AI-generated content
        const transcriptToUse = data.transcript || transcript;
        const roleToUse = data.role || role;
        const candidateNameToUse = data.candidateName || candidateName;
        
        if (!transcriptToUse || transcriptToUse.trim().length === 0) {
          throw new Error('No interview transcript found. AI feedback requires actual interview content to analyze.');
        }
        
        console.log('Generating comprehensive AI feedback for actual interview content');
        
        const feedbackData = await generateNewFeedback(transcriptToUse, roleToUse, candidateNameToUse);
        
        // Save new AI-generated feedback to database
        await updateDoc(doc(db, 'interviews', id), {
          feedback: feedbackData,
          score: parseInt(feedbackData.overallRating) || 7,
          feedbackGeneratedAt: new Date().toISOString()
        });
        
        setFeedback(feedbackData);
        toast({
          title: "AI Feedback Generated",
          description: "Comprehensive interview analysis completed using actual interview content!",
        });
        
      } else {
        throw new Error('Interview record not found. Cannot generate AI feedback without interview data.');
      }
      
    } catch (error) {
      console.error('Error loading/generating AI feedback:', error);
      toast({
        title: "AI Feedback Generation Failed", 
        description: error instanceof Error ? error.message : "Failed to generate AI feedback from interview content.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  const handleRetryFeedback = async () => {
    setRetrying(true);
    await loadFeedback();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingProgress = (rating: number) => {
    return (rating / 10) * 100;
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 9) return 'Excellent';
    if (rating >= 8) return 'Very Good';
    if (rating >= 7) return 'Good';
    if (rating >= 6) return 'Satisfactory';
    if (rating >= 5) return 'Needs Improvement';
    return 'Poor';
  };

  const getInterviewDate = () => {
    if (interviewData?.startTime) {
      return new Date(interviewData.startTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {retrying ? "Regenerating AI feedback from interview content..." : "AI is analyzing your actual interview transcript..."}
          </p>
          <p className="text-sm text-gray-500 mt-2">Creating personalized feedback based on your responses</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-6">
            <h2 className="text-xl font-semibold mb-2">AI Analysis Required</h2>
            <p className="text-gray-600 mb-4">AI feedback requires actual interview transcript data for analysis.</p>
            <div className="space-y-2">
              <Button onClick={handleRetryFeedback} disabled={retrying} className="w-full">
                {retrying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Interview Content...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate AI Analysis
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rating = parseInt(feedback.overallRating) || 7;
  const transcriptArr = getTranscriptArray();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="ghost"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Briefcase className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">AI-Generated Interview Analysis</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleRetryFeedback}
                variant="outline"
                size="sm"
                disabled={retrying}
              >
                {retrying ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Regenerate Analysis
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                size="sm"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* --- NEW: Show Transcript Card --- */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Full Interview Transcript</span>
              <Badge variant="secondary">Actual Conversation</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transcriptArr.length === 0 ? (
              <div className="text-gray-500 py-8 text-center">
                No transcript available for this interview.
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {transcriptArr.map((entry, idx) => {
                  const isAI = entry.toLowerCase().startsWith("ai interviewer:");
                  const isCandidate = entry.toLowerCase().startsWith("you:") 
                    || entry.toLowerCase().startsWith("candidate:") 
                    || entry.toLowerCase().startsWith("user:");
                  return (
                    <div
                      key={idx}
                      className={`flex items-start ${
                        isAI
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : isCandidate
                            ? "bg-gray-100 border-l-4 border-gray-400"
                            : ""
                      } rounded p-3 shadow`}
                    >
                      <span className="font-semibold mr-2 text-blue-700">
                        {isAI
                          ? "AI Interviewer:"
                          : isCandidate
                            ? "You:"
                            : ""}
                      </span>
                      <span className="text-gray-800">
                        {isAI
                          ? entry.replace(/^AI Interviewer:\s?/i, "")
                          : isCandidate
                            ? entry.replace(/^(You:|Candidate:|User:)\s?/i, "")
                            : entry}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Candidate Information Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <User className="h-8 w-8" />
                  <div>
                    <h2 className="text-2xl font-bold">{candidateName}</h2>
                    <p className="text-blue-100">Interview Candidate</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-200" />
                    <div>
                      <p className="text-sm text-blue-200">Position</p>
                      <p className="font-semibold text-lg">{role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-200" />
                    <div>
                      <p className="text-sm text-blue-200">Interview Date</p>
                      <p className="font-semibold">{getInterviewDate()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-200" />
                    <div>
                      <p className="text-sm text-blue-200">Duration</p>
                      <p className="font-semibold">{formatDuration(duration)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className={`text-4xl font-bold text-white`}>
                    {rating}/10
                  </div>
                  <div className="text-blue-200 text-sm">{getRatingLabel(rating)}</div>
                  <div className="flex items-center justify-center space-x-1 mt-2">
                    <Star className="h-4 w-4 text-yellow-300" />
                    <span className="text-sm text-blue-200">AI Score</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* AI Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span>AI Interview Analysis</span>
              <Badge variant="secondary">Generated from Actual Interview</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={getRatingProgress(rating)} className="mb-4" />
            <p className="text-gray-700 text-lg leading-relaxed">{feedback.summary}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <TrendingUp className="h-5 w-5" />
                <span>Key Strengths</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-700">
                <TrendingDown className="h-5 w-5" />
                <span>Areas for Improvement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {feedback.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Technical Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Skills Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{feedback.technicalSkills}</p>
            </CardContent>
          </Card>

          {/* Communication Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Communication Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{feedback.communicationSkills}</p>
            </CardContent>
          </Card>

          {/* Interview Insights */}
          {feedback.interviewInsights && (
            <Card>
              <CardHeader>
                <CardTitle>Interview Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{feedback.interviewInsights}</p>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          {feedback.nextSteps && (
            <Card>
              <CardHeader>
                <CardTitle>Recommended Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{feedback.nextSteps}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recommendations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Personalized Development Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">{feedback.recommendations}</p>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Specific Action Items:</h4>
                <ul className="space-y-3">
                  {feedback.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            size="lg"
          >
            Practice More Interviews
          </Button>
          <Button
            onClick={() => window.print()}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Download Analysis Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
