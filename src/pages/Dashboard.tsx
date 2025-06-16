import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Play, Calendar, Briefcase, User, LogOut, Clock, Trophy, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Interview {
  id: string;
  title: string;
  role: string;
  date: string;
  status: 'completed' | 'in-progress' | 'scheduled';
  score?: number;
}

interface Template {
  id: string;
  title: string;
  role: string;
  description: string;
  duration: string;
  color: string;
  icon: string;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  const templates: Template[] = [
    {
      id: '1',
      title: 'Frontend Developer',
      role: 'Frontend Developer',
      description: 'React, JavaScript, CSS, HTML, UI/UX principles',
      duration: '30 min',
      color: 'from-blue-500 to-cyan-500',
      icon: '💻'
    },
    {
      id: '2',
      title: 'Backend Developer',
      role: 'Backend Developer',
      description: 'Node.js, APIs, Databases, System Design',
      duration: '45 min',
      color: 'from-green-500 to-emerald-500',
      icon: '⚙️'
    },
    {
      id: '3',
      title: 'Full Stack Developer',
      role: 'Full Stack Developer',
      description: 'Frontend + Backend technologies, Architecture',
      duration: '60 min',
      color: 'from-purple-500 to-violet-500',
      icon: '🚀'
    },
    {
      id: '4',
      title: 'Data Scientist',
      role: 'Data Scientist',
      description: 'Python, Machine Learning, Statistics, SQL',
      duration: '45 min',
      color: 'from-orange-500 to-red-500',
      icon: '📊'
    }
  ];

  useEffect(() => {
    fetchInterviews();
  }, [user]);

  const fetchInterviews = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'interviews'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const interviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Interview[];
      
      setInterviews(interviewsData);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast({
        title: "Error",
        description: "Failed to load interviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async (template: Template) => {
    if (!user) return;

    try {
      const interviewData = {
        userId: user.uid,
        title: `${template.role} Interview`,
        role: template.role,
        date: new Date().toISOString(),
        status: 'in-progress',
        templateId: template.id
      };

      const docRef = await addDoc(collection(db, 'interviews'), interviewData);
      
      toast({
        title: "Success",
        description: "Interview started successfully!",
      });
      
      navigate(`/interview/${docRef.id}`, { 
        state: { 
          role: template.role,
          roleDescription: template.description,
          interviewId: docRef.id 
        } 
      });
    } catch (error) {
      console.error('Error starting interview:', error);
      toast({
        title: "Error",
        description: "Failed to start interview",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInterviewImage = (role: string) => {
    const roleImages = {
      'Frontend Developer': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=200&fit=crop',
      'Backend Developer': 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=200&fit=crop',
      'Full Stack Developer': 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=200&fit=crop',
      'Data Scientist': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200&fit=crop',
    };
    return roleImages[role as keyof typeof roleImages] || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=200&fit=crop';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const completedInterviews = interviews.filter(i => i.status === 'completed').length;
  const averageScore = interviews.filter(i => i.score).reduce((acc, i) => acc + (i.score || 0), 0) / interviews.filter(i => i.score).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Interview Platform
                </h1>
                <p className="text-sm text-gray-600">Practice makes perfect</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{user?.email}</span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Stats */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Welcome back, {user?.email?.split('@')[0]}! 👋
            </h2>
            <p className="text-xl text-gray-600">Ready to ace your next interview?</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Interviews</p>
                    <p className="text-3xl font-bold">{interviews.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold">{completedInterviews}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-violet-500 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Average Score</p>
                    <p className="text-3xl font-bold">{averageScore ? averageScore.toFixed(1) : '0'}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Practice Templates */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Practice Templates</h3>
              <p className="text-gray-600">Choose your interview type and start practicing</p>
            </div>
            <PlusCircle className="h-8 w-8 text-blue-600" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className={`w-full h-32 bg-gradient-to-r ${template.color} rounded-lg flex items-center justify-center text-4xl mb-4`}>
                    {template.icon}
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">{template.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Clock className="h-3 w-3 mr-1" />
                      {template.duration}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-6 line-clamp-2">{template.description}</p>
                  <Button
                    onClick={() => startInterview(template)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Interview
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Interviews */}
        <div>
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Recent Interviews</h3>
            <p className="text-gray-600">Track your progress and review past performances</p>
          </div>
          
          {interviews.length === 0 ? (
            <Card className="text-center py-16 bg-white/70 backdrop-blur-sm border-0">
              <CardContent>
                <div className="mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop&crop=face" 
                    alt="No interviews yet" 
                    className="w-32 h-32 mx-auto rounded-full object-cover opacity-60"
                  />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">Ready for your first interview?</h4>
                <p className="text-gray-600 text-lg">Choose a template above and start practicing with our AI interviewer!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviews.map((interview) => (
                <Card key={interview.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/70 backdrop-blur-sm border-0">
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={getInterviewImage(interview.role)} 
                      alt={interview.role}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">{interview.title}</CardTitle>
                      <Badge className={getStatusColor(interview.status)}>
                        {interview.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="h-4 w-4 mr-2" />
                        <span>{interview.role}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(interview.date).toLocaleDateString()}</span>
                      </div>
                      {interview.score && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Trophy className="h-4 w-4 mr-2" />
                          <span className="font-semibold text-green-600">{interview.score}/10</span>
                        </div>
                      )}
                    </div>
                    {interview.status === 'completed' && (
                      <Button
                        onClick={() => navigate(`/feedback/${interview.id}`)}
                        variant="outline"
                        size="sm"
                        className="w-full mt-4 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                      >
                        View Feedback
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
