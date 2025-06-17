import { useEffect, useState } from 'react';
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
  TrendingUp,
  Crown
} from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Index = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // <-- add logout here

  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (window.location.hash === '#pricing') {
      const el = document.getElementById('pricing');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleAdminLogin = async () => {
  setLoading(true);
  if (adminPass === 'admin123') {
    if (!user) {
      alert('Please sign in as admin to view data.');
      setLoading(false);
      return;
    }
    setAdminLoggedIn(true);
    const snap = await getDocs(collection(db, 'interviews'));
    setInterviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } else {
    alert('Incorrect password');
  }
  setLoading(false);
};

  const handleLogout = async () => {
    await logout();
    navigate('/'); // Stay on index page after logout
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img
                src="https://d502jbuhuh9wk.cloudfront.net/logos/6677da88a7c70751b1bf34a8.png?v=1"
                alt="Logo"
                className="h-10 w-10 object-contain"
              />
             
              <h1 className="text-2xl font-bold text-gray-900">Analytics Career</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    Logout
                  </Button>
                </>
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
              {/* Admin Button - Now inline with other buttons */}
              <Button
                variant="ghost"
                className="rounded-full border border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                onClick={() => setAdminOpen(true)}
                title="Admin Login"
              >
                <Crown className="h-6 w-6 mr-1" />
                <span className="font-semibold">Admin</span>
              </Button>
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

      
      <section id="pricing" className="py-24 bg-gradient-to-br from-blue-50 to-purple-100">
  <div className="max-w-6xl mx-auto px-6">
    <h2 className="text-4xl font-extrabold text-center mb-3 bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
      Choose Your Plan
    </h2>
    <p className="text-center text-gray-600 mb-14 text-lg">
      Start for free, or upgrade for unlimited AI interview practice
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {/* Free Plan */}
      <div className="bg-white rounded-3xl shadow-lg p-8 border border-blue-300 hover:shadow-2xl transition-all duration-300">
        <h3 className="text-2xl font-semibold text-blue-700 mb-3 text-left">Free</h3>
        <div className="text-5xl font-bold mb-1 text-left">$0</div>
        <div className="text-gray-500 mb-6 text-left">Forever</div>
        <ul className="text-gray-700 mb-8 space-y-2 text-sm text-left leading-relaxed">
          <li>✅ 3 AI interview sessions</li>
          <li>✅ Basic feedback reports</li>
          <li>✅ Voice interaction</li>
          <li>✅ Video interview simulation</li>
          <li>✅ Progress tracking</li>
        </ul>
        <Button
          className="w-full py-3 px-5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          onClick={() => navigate('/signup')}
        >
          Get Started Free
        </Button>
      </div>

      {/* Monthly Plan - Highlighted */}
      <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-purple-500 relative hover:scale-[1.03] transition-transform duration-300">
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-4 py-1 rounded-full font-bold shadow">
          Most Popular
        </span>
        <h3 className="text-2xl font-semibold text-purple-700 mb-3 text-left">Monthly</h3>
        <div className="text-5xl font-bold mb-1 text-left">$19</div>
        <div className="text-gray-500 mb-6 text-left">Per Month</div>
        <ul className="text-gray-700 mb-8 space-y-2 text-sm text-left leading-relaxed">
          <li>✅ Unlimited AI interviews</li>
          <li>✅ Advanced feedback & analytics</li>
          <li>✅ Multiple role templates</li>
          <li>✅ Priority voice processing</li>
          <li>✅ Custom interview scenarios</li>
          <li>✅ Email support</li>
        </ul>
        <Button
          className="w-full py-3 px-5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
          onClick={() => navigate('/signup')}
        >
          Start Monthly Plan
        </Button>
      </div>

      {/* Yearly Plan */}
      <div className="bg-white rounded-3xl shadow-lg p-8 border border-blue-300 hover:shadow-2xl transition-all duration-300">
        <h3 className="text-2xl font-semibold text-blue-700 mb-3 text-left">Yearly</h3>
        <div className="text-5xl font-bold mb-1 text-left">$199</div>
        <div className="text-gray-500 mb-6 text-left">Per Year</div>
        <ul className="text-gray-700 mb-8 space-y-2 text-sm text-left leading-relaxed">
          <li>✅ Everything in Monthly</li>
          <li>✅ <span className="text-green-600 font-medium">Save $29 per year</span></li>
          <li>✅ Premium interview scenarios</li>
          <li>✅ Detailed performance analytics</li>
          <li>✅ Priority customer support</li>
          <li>✅ 1-on-1 coaching session</li>
        </ul>
        <Button
          className="w-full py-3 px-5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          onClick={() => navigate('/signup')}
        >
          Choose Yearly
        </Button>
      </div>
    </div>
  </div>
</section>




      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img
                src="https://d502jbuhuh9wk.cloudfront.net/logos/6677da88a7c70751b1bf34a8.png?v=1"
                alt="Logo"
                className="h-10 w-10 object-contain"
              />
              <span className="text-lg font-semibold">Analytics Career</span>
            </div>
            
            <div className="text-sm text-gray-400">
              © 2025 Analytics Career. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Admin Dialog */}
      <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="max-w-7xl"> {/* Increased width */}
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-600" />
              Admin Panel
            </DialogTitle>
            <DialogDescription>
              Login to view all interview records.
            </DialogDescription>
          </DialogHeader>
          {!adminLoggedIn ? (
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={adminPass}
                onChange={e => setAdminPass(e.target.value)}
                className="w-full"
              />
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleAdminLogin}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login as Admin'}
              </Button>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold mb-4 text-lg">All Interview Records</h3>
              <div className="max-h-[600px] overflow-auto rounded-lg border border-gray-200 bg-white shadow">
                <table className="min-w-full text-sm">
                 
<thead className="sticky top-0 bg-gray-100 z-10">
  <tr>
    <th className="p-3 text-left font-semibold">Candidate</th>
    <th className="p-3 text-left font-semibold">Role</th>
    <th className="p-3 text-left font-semibold">Status</th>
    <th className="p-3 text-left font-semibold">Score</th>
    <th className="p-3 text-left font-semibold">Date</th>
    <th className="p-3 text-left font-semibold w-72">Transcript</th>
    <th className="p-3 text-left font-semibold w-72">Feedback</th> {/* New column */}
  </tr>
</thead>
<tbody>
  {interviews.map((i) => (
    <tr key={i.id} className="border-b hover:bg-gray-50">
      <td className="p-3">{i.candidateName}</td>
      <td className="p-3">{i.role}</td>
      <td className="p-3">{i.status}</td>
      <td className="p-3">{i.score ?? '-'}</td>
      <td className="p-3">{i.createdAt ? new Date(i.createdAt).toLocaleString() : '-'}</td>
      <td className="p-3 align-top">
        <div
          className="bg-gray-100 border border-gray-300 rounded p-2 max-h-32 min-h-[2.5rem] overflow-y-auto text-xs font-mono"
          style={{ width: '18rem' }}
        >
          {i.transcript
            ? typeof i.transcript === "string"
              ? i.transcript
              : Array.isArray(i.transcript)
                ? i.transcript.join('\n')
                : "-"
            : "-"}
        </div>
      </td>


      <td className="p-3 align-top">
  <div
    className="bg-gray-100 border border-gray-300 rounded p-2 max-h-32 min-h-[2.5rem] overflow-y-auto text-xs font-mono"
    style={{ width: '18rem' }}
  >
    {i.feedback && typeof i.feedback === "object" && !Array.isArray(i.feedback) ? (
      <div className="space-y-2">
        {Object.entries(i.feedback).map(([key, value]) => (
          <div key={key}>
            <span className="font-semibold">{key}:</span>{" "}
            <span>{value}</span>
          </div>
        ))}
      </div>
    ) : (
      i.feedback
        ? typeof i.feedback === "string"
          ? i.feedback
          : Array.isArray(i.feedback)
            ? i.feedback.join('\n')
            : "-"
        : "-"
    )}
  </div>
</td>


    </tr>
  ))}
</tbody>

                </table>
                {interviews.length === 0 && (
                  <div className="text-gray-500 text-center py-8">No interviews found.</div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      
    </div>
  );
};

export default Index;
