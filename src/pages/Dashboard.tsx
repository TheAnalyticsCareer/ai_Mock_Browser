import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Play, Calendar, Briefcase, User, LogOut, Clock, Trophy, TrendingUp, Home, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { FiPlusCircle } from "react-icons/fi";
import CreateTemplateModal from "../components/CreateTemplateModal";
import { Select } from '@/components/ui/select'; // If you have a custom Select component

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
  isCustom?: boolean; // flag for user-created templates
}

const DEFAULT_TEMPLATES: Template[] = [
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
  },
  {
    id: '5',
    title: 'Data Analytics',
    role: 'Data Analyst',
    description: 'Data analysis, Excel, SQL, Visualization, Business Insights',
    duration: '40 min',
    color: 'from-blue-700 to-blue-300',
    icon: '📈'
  },
  {
    id: '6',
    title: 'ML Engineer',
    role: 'Machine Learning Engineer',
    description: 'ML algorithms, Python, Model Deployment, MLOps',
    duration: '50 min',
    color: 'from-green-700 to-green-300',
    icon: '🤖'
  },
  {
    id: '7',
    title: 'AI Engineer',
    role: 'AI Engineer',
    description: 'AI systems, Deep Learning, NLP, Computer Vision',
    duration: '55 min',
    color: 'from-purple-700 to-purple-300',
    icon: '🧠'
  },
  {
    id: '8',
    title: 'Manufacturing Supervisor',
    role: 'Manufacturing Supervisor',
    description: 'Production management, Lean, Quality control, Team leadership',
    duration: '35 min',
    color: 'from-yellow-700 to-yellow-300',
    icon: '🏭'
  }
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(5);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [globalTemplates, setGlobalTemplates] = useState<Template[]>([]);
  const [filterRole, setFilterRole] = useState<string>('All');

  // Helper to check admin
  const isAdmin = user?.email === "admin@gmail.com";

  // Fetch user-created templates
  useEffect(() => {
    const fetchCustomTemplates = async () => {
      if (!user) return;
      try {
        const q = collection(db, "users", user.uid, "templates");
        const querySnapshot = await getDocs(q);
        const templatesData: Template[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          color: 'from-pink-500 to-yellow-300', // default color for custom templates
          icon: '⭐',
          isCustom: true
        })) as Template[];
        setCustomTemplates(templatesData);
      } catch (error) {
        console.error('Error fetching custom templates:', error);
      }
    };
    fetchCustomTemplates();
  }, [user, showTemplateModal]); // refetch when modal closes (new template added)

  // Fetch global templates (admin-created)
  useEffect(() => {
    const fetchGlobalTemplates = async () => {
      try {
        const q = collection(db, "global_templates");
        const querySnapshot = await getDocs(q);
        const templatesData: Template[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          color: 'from-yellow-500 to-orange-300',
          icon: '⭐',
          isCustom: true
        })) as Template[];
        setGlobalTemplates(templatesData);
      } catch (error) {
        console.error('Error fetching global templates:', error);
      }
    };
    fetchGlobalTemplates();
  }, [showTemplateModal]);

  useEffect(() => {
    fetchInterviews();
  }, [user]);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAttemptsLeft(docSnap.data().attemptsLeft ?? 5);
        }
      };
      fetchProfile();
    }
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
    if (attemptsLeft <= 0) {
      toast({
        title: "No Attempts Left",
        description: "You have used all your free interview attempts.",
        variant: "destructive",
      });
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      // Create the document if it doesn't exist
      await setDoc(userRef, {
        attemptsLeft: 5,
        totalInterviews: 0,
        completed: 0,
        averageScore: 0
      });
    }

    await updateDoc(userRef, {
      attemptsLeft: attemptsLeft - 1,
    });
    setAttemptsLeft(attemptsLeft - 1);

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

  // Only allow admin to open modal
  const handleOpenTemplateModal = () => {
    if (isAdmin) setShowTemplateModal(true);
  };

  // Only allow admin to delete
  const handleDeleteTemplate = async (templateId: string) => {
    if (!user || !isAdmin) return;
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "templates", templateId));
      setCustomTemplates((prev) => prev.filter((t) => t.id !== templateId));
      toast({
        title: "Deleted",
        description: "Template deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template.",
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
      'Data Analytics': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=200&fit=crop',
      'ML Engineer': 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=200&fit=crop',
      'AI Engineer': 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=200&fit=crop',
      'Manufacturing Supervisor': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200&fit=crop',
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

  // Combine all templates
  const allTemplates = [
    ...DEFAULT_TEMPLATES,
    ...globalTemplates,
    ...customTemplates // user-specific
  ];

  // Get unique roles for dropdown options
  const templateRoles = Array.from(new Set(allTemplates.map(t => t.role)));

  // Filtered templates
  const filteredTemplates = filterRole === 'All'
    ? allTemplates
    : allTemplates.filter(t => t.role === filterRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Responsive Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <img
                src="https://d502jbuhuh9wk.cloudfront.net/logos/6677da88a7c70751b1bf34a8.png?v=1"
                alt="Logo"
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
              />
              <div>
                <button
                  onClick={() => navigate('/')}
                  className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text focus:outline-none"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  AI Interviewer
                </button>
                <p className="text-xs sm:text-sm text-gray-600">Powered by Analytics Career</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-3 sm:mt-0">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Home
              </Button>
              
              <div className="flex items-center space-x-2 bg-gray-50 rounded-full px-2 sm:px-4 py-1">
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[100px]">
                  {user?.email}
                </span>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Attempts Left Section */}
        <div className="mb-6 sm:mb-8 flex justify-center md:justify-end">
          <Card className="w-full md:w-1/2 lg:w-1/3 bg-gradient-to-r from-yellow-100 to-yellow-50 border-0 shadow-md">
            <CardContent className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6">
              <div className="mb-3 sm:mb-0">
                <CardTitle className="text-base sm:text-lg text-yellow-800 mb-1">Attempts Left</CardTitle>
                <div className="text-2xl sm:text-3xl font-bold text-yellow-700">
                  {attemptsLeft === -1 ? "Unlimited" : attemptsLeft}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Free interview attempts</div>
              </div>
              <div className="flex items-center">
                {attemptsLeft > 0 ? (
                  <Badge className="bg-yellow-200 text-yellow-800 text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2 rounded-full">
                    Available
                  </Badge>
                ) : (
                  <Button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm"
                    onClick={() => navigate('/#pricing')}
                  >
                    Buy More
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Section with Stats */}
        <div className="mb-8 sm:mb-12">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Welcome back, {user?.email?.split('@')[0]}! 👋
            </h2>
            <p className="text-base sm:text-lg text-gray-600">Ready to ace your next interview?</p>
          </div>

          {/* Responsive Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Interviews</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold">{interviews.length}</p>
                  </div>
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs sm:text-sm font-medium">Completed</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold">{completedInterviews}</p>
                  </div>
                  <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-violet-500 text-white border-0">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs sm:text-sm font-medium">Average Score</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold">
                      {averageScore ? averageScore.toFixed(1) : '0'}
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Practice Templates */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                Practice Interviews
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Choose your interview type and start practicing
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="template-filter" className="text-sm text-gray-700">Filter by Role:</label>
              <select
                id="template-filter"
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="All">All</option>
                {templateRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            {isAdmin && (
              <button
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm sm:text-base"
                onClick={handleOpenTemplateModal}
              >
                <FiPlusCircle size={20} />
                <span>Create Template</span>
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/70 backdrop-blur-sm relative"
              >
                <CardHeader className="pb-2 sm:pb-3">
                  <div className={`w-full h-24 sm:h-32 bg-gradient-to-r ${template.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4`}>
                    <span className="text-base sm:text-lg md:text-xl font-bold text-white text-center px-2">
                      {template.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {template.duration}
                    </Badge>
                    {template.isCustom && (
                      <Badge className="bg-pink-100 text-pink-700 text-xs">Custom</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 line-clamp-2">
                    {template.description}
                  </p>
                  <Button
                    onClick={() => startInterview(template)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg text-xs sm:text-sm"
                  >
                    <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Start Interview
                  </Button>
                </CardContent>
                {template.isCustom && isAdmin && (
                  <button
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Interviews */}
        <div>
          <div className="mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              Recent Interviews
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Track your progress and review past performances
            </p>
          </div>
          
          {interviews.length === 0 ? (
            <Card className="text-center py-8 sm:py-16 bg-white/70 backdrop-blur-sm border-0">
              <CardContent>
                <div className="mb-4 sm:mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop&crop=face" 
                    alt="No interviews yet" 
                    className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full object-cover opacity-60"
                  />
                </div>
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Ready for your first interview?
                </h4>
                <p className="text-gray-600 text-sm sm:text-base">
                  Choose a template above and start practicing!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {interviews.map((interview) => (
                <Card 
                  key={interview.id} 
                  className="group hover:shadow-lg transition-all duration-300 overflow-hidden bg-white/70 backdrop-blur-sm border-0"
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={getInterviewImage(interview.role)} 
                      alt={interview.role}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm sm:text-base md:text-lg group-hover:text-blue-600">
                        {interview.title}
                      </CardTitle>
                      <Badge className={`text-xs ${getStatusColor(interview.status)}`}>
                        {interview.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span>{interview.role}</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span>{new Date(interview.date).toLocaleDateString()}</span>
                      </div>
                      {interview.score && (
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="font-semibold text-green-600">{interview.score}/10</span>
                        </div>
                      )}
                    </div>
                    {interview.status === 'completed' && (
                      <Button
                        onClick={() => navigate(`/feedback/${interview.id}`)}
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 sm:mt-4 text-xs sm:text-sm"
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
        
        {/* Template Modal */}
        {showTemplateModal && isAdmin && (
          <CreateTemplateModal
            userId={user?.uid}
            userEmail={user?.email}
            onClose={() => setShowTemplateModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;