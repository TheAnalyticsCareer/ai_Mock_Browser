import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Briefcase, 
  Mic, 
  Camera, 
  Brain, 
  Star, 
  CheckCircle,
  ArrowRight,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      title: "AI-Powered Interviews",
      description: "Practice with advanced AI that asks real interview questions"
    },
    {
      icon: <Mic className="h-8 w-8 text-green-600" />,
      title: "Voice Interaction",
      description: "Natural conversation with real-time voice recognition"
    },
    {
      icon: <Camera className="h-8 w-8 text-purple-600" />,
      title: "Video Interview Simulation",
      description: "Experience realistic video interview environment"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
      title: "Detailed Feedback",
      description: "Get comprehensive analysis and improvement suggestions"
    }
  ];

  const benefits = [
    "Realistic interview simulation",
    "Instant AI-generated feedback",
    "Multiple role templates",
    "Progress tracking",
    "Voice and video practice",
    "24/7 availability"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">AI Interview Coach</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => navigate('/login')}
                    variant="ghost"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate('/signup')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Master Your
            <span className="text-blue-600"> Interview Skills</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Practice with our AI-powered interview coach. Get real-time feedback, 
            improve your responses, and land your dream job with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              onClick={() => navigate(user ? '/dashboard' : '/signup')}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            >
              Start Practicing Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span>Free to start • No credit card required</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Interviews Practiced</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600">Job Roles</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose AI Interview Coach?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the most realistic and effective interview practice platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">
                Everything You Need to Succeed
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Our comprehensive platform provides all the tools and insights 
                you need to excel in any interview situation.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center space-x-4">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Multiple Interview Types</h4>
                    <p className="text-gray-600">Technical, behavioral, and case study interviews</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center space-x-4">
                  <Award className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Personalized Feedback</h4>
                    <p className="text-gray-600">AI-powered analysis of your performance</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center space-x-4">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Progress Tracking</h4>
                    <p className="text-gray-600">Monitor your improvement over time</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Ace Your Next Interview?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who have improved their interview skills 
            and landed their dream jobs.
          </p>
          
          <Button
            onClick={() => navigate(user ? '/dashboard' : '/signup')}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            Start Your Free Practice Session
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Briefcase className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-semibold">AI Interview Coach</span>
            </div>
            
            <div className="text-sm text-gray-400">
              © 2024 AI Interview Coach. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
