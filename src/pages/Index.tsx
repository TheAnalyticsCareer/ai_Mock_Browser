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
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { QRCodeSVG } from "qrcode.react";
import { Dialog as HeadlessDialog } from "@headlessui/react";
import emailjs from 'emailjs-com'; // Add this import at the top
import Footer from "@/components/ui/Footer";
import PaymentFormModal from "@/components/PaymentFormModal";

// Constants for names and content
const HERO_TITLE_PART1 = "Master Your";
const HERO_TITLE_PART2 = " Interview Skills";
const HERO_DESCRIPTION = "Practice with our AI-powered interview coach. Get real-time feedback, improve your responses, and land your dream job with confidence.";
const FREE_TO_START_MESSAGE = "Free to start • No credit card required";

const FEATURES_CONTENT = [
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

const BENEFITS_CONTENT = [
    "Realistic interview simulation",
    "Instant AI-generated feedback",
    "Multiple role templates",
    "Progress tracking",
    "Voice and video practice",
    "24/7 availability"
];

const PRICING_PLANS = [
    {
        name: "Free",
        price: "$0",
        frequency: "Forever",
        features: [
            "✅ 3 AI interview sessions",
            "✅ Basic feedback reports",
            "✅ Voice interaction",
            "✅ Video interview simulation",
            "✅ Progress tracking",
        ],
        buttonText: "Get Started Free",
        buttonOnClick: (navigate: any) => navigate('/signup'),
        highlighted: false,
        borderColor: "border-blue-300",
        buttonBgColor: "bg-blue-600 hover:bg-blue-700",
        textColor: "text-blue-700"
    },
    
    {
        name: "Monthly",
        price: "$19",
        frequency: "Per Month",
        features: [
            "✅ Unlimited AI interviews",
            "✅ Advanced feedback & analytics",
            "✅ Multiple role templates",
            "✅ Priority voice processing",
            "✅ Custom interview scenarios",
            "✅ Email support",
        ],
        buttonText: "Start Monthly Plan",
        buttonOnClick: (handleMonthlyPayment: () => void) => handleMonthlyPayment(),
        highlighted: true,
        borderColor: "border-purple-500",
        buttonBgColor: "bg-purple-600 hover:bg-purple-700",
        textColor: "text-purple-700"
    },
    {
        name: "Yearly",
        price: "$199",
        frequency: "Per Year",
        features: [
            "✅ Everything in Monthly",
            "✅ <span className=\"text-green-600 font-medium\">Save $29 per year</span>",
            "✅ Premium interview scenarios",
            "✅ Detailed performance analytics",
            "✅ Priority customer support",
            "✅ 1-on-1 coaching session",
        ],
        buttonText: "Choose Yearly",
        buttonOnClick: (navigate: any) => navigate('/signup'),
        highlighted: false,
        borderColor: "border-blue-300",
        buttonBgColor: "bg-blue-600 hover:bg-blue-700",
        textColor: "text-blue-700"
    },{
        name: "Academia / Enterprise",
        price: "",
        frequency: "Contact-US",
        features: [
            "✅ Focus on Foundational Interview Skills",
            "✅ Limited Resume & Cover Letter Feedback",
            "✅ Short & Focused Practice Sessions",
            "✅ Basic Performance Analytics",
            "✅ Access to Student Role Templates",
        ],
        buttonText: "Get Started",
        buttonOnClick: (navigate: any) => navigate('/signup'),
        highlighted: false,
        borderColor: "border-yellow-300",
        buttonBgColor: "bg-yellow-600 hover:bg-yellow-700",
        textColor: "text-yellow-700"
    },
];

const TESTIMONIALS_CONTENT = [
 {
    name: "Isabella Thompson",
    image: "https://randomuser.me/api/portraits/women/46.jpg",
    review: "The AI agent felt so human-like. It pushed me with challenging follow-ups and helped me improve my thinking on the spot.",
},
{
    name: "Mason Lee",
    image: "https://randomuser.me/api/portraits/men/47.jpg",
    review: "The instant transcript feature helped me analyze exactly what I said and where I hesitated. Great for self-evaluation.",
},
{
    name: "Ava Johnson",
    image: "https://randomuser.me/api/portraits/women/48.jpg",
    review: "The feedback wasn’t generic—it was specific to my answers, tone, and confidence. That made all the difference!",
},
{
    name: "Logan White",
    image: "https://randomuser.me/api/portraits/men/49.jpg",
    review: "As someone switching careers, this platform helped me practice domain-specific interviews and build relevant confidence.",
},
{
    name: "Mia Hernandez",
    image: "https://randomuser.me/api/portraits/women/50.jpg",
    review: "I loved how the platform broke down my performance into clarity, fluency, and confidence scores. Super helpful!",
},
{
    name: "Lucas Hall",
    image: "https://randomuser.me/api/portraits/men/51.jpg",
    review: "Practicing under pressure with timed questions helped me manage stress during real interviews.",
},
{
    name: "Ella Young",
    image: "https://randomuser.me/api/portraits/women/52.jpg",
    review: "I practiced for FAANG-level system design interviews with this tool, and the AI adapted the questions beautifully.",
},
{
    name: "Henry King",
    image: "https://randomuser.me/api/portraits/men/53.jpg",
    review: "It’s like having a personal coach 24/7. I practiced daily and noticed a massive boost in my articulation.",
},
{
    name: "Grace Lopez",
    image: "https://randomuser.me/api/portraits/women/54.jpg",
    review: "From HR rounds to technical deep-dives, this platform helped me cover every interview format.",
},
{
    name: "Sebastian Rivera",
    image: "https://randomuser.me/api/portraits/men/55.jpg",
    review: "The mock interviews were so close to real interviews that I didn’t panic during the actual one!",
}

];

const HOW_IT_WORKS_CONTENT = [
    {
        title: "Choose Your Role",
        description: "Select from a variety of popular job roles or customize your own interview scenario.",
        icon: <Briefcase className="h-12 w-12 text-purple-500 mb-4" />,
    },
    {
        title: "Practice with AI",
        description: "Our advanced AI will ask you relevant interview questions based on your chosen role.",
        icon: <Brain className="h-12 w-12 text-blue-500 mb-4" />,
    },
    {
        title: "Get Instant Feedback",
        description: "Receive immediate analysis on your responses, including areas for improvement.",
        icon: <Award className="h-12 w-12 text-green-500 mb-4" />,
    },
    {
        title: "Improve and Succeed",
        description: "Refine your skills with each practice session and gain the confidence to ace your real interviews.",
        icon: <TrendingUp className="h-12 w-12 text-orange-500 mb-4" />,
    },
];

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
    const [upiModalOpen, setUpiModalOpen] = useState(false);
    const [showTxnInput, setShowTxnInput] = useState(false);
    const [txnId, setTxnId] = useState('');
    const [sending, setSending] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    // Your UPI details
    const upiId = "savitribhatt5530@okaxis"; // Replace with your UPI ID
    const payeeName = "Analytics Career";
    const amount = 1; // Monthly price
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;

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

    const handleMonthlyPayment = () => {
        setUpiModalOpen(true);
    };

    const handlePricingClick = () => setPaymentModalOpen(true);

    const handlePaymentSubmit = async (form: any) => {
        setPaymentLoading(true);
        try {
            await addDoc(collection(db, "payments"), {
                ...form,
                createdAt: Timestamp.now(),
            });
            alert("Registration submitted! We'll verify your payment soon.");
        } catch (error) {
            alert("Failed to submit registration. Please try again.");
        } finally {
            setPaymentLoading(false);
            setPaymentModalOpen(false);
        }
    };

    // Add this function inside your component
    const sendTxnEmail = async () => {
        setSending(true);
        try {
            await emailjs.send(
                'service_qlhd5tc', // Your Service ID
                'template_2mbdyvr', // Your Template ID
                {
                    to_email: 'bhattsushant4@gmail.com',
                    transaction_id: txnId,
                },
                'B9S3vjE_6ujpIEkI1' // Your Public Key
            );
            alert('Transaction ID sent successfully!');
            setShowTxnInput(false);
            setTxnId('');
            setUpiModalOpen(false);
        } catch (err) {
            alert('Failed to send email. Please try again.');
        }
        setSending(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 font-sans">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <img
                                src="https://d502jbuhuh9wk.cloudfront.net/logos/6677da88a7c70751b1bf34a8.png?v=1"
                                alt="Logo"
                                className="h-10 w-10 object-contain"
                            />
                            <h1 className="text-2xl font-bold text-gray-900">AI Interviewer</h1>
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
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-100 to-purple-100">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
                        {HERO_TITLE_PART1}
                        <span className="text-blue-600">{HERO_TITLE_PART2}</span>
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        {HERO_DESCRIPTION}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                        <Button
                            onClick={() => navigate(user ? '/dashboard' : '/signup')}
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3 rounded-full"
                        >
                            Start Practicing Now
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span>{FREE_TO_START_MESSAGE}</span>
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

            {/* How It Works Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h3>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Get started in three easy steps
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {HOW_IT_WORKS_CONTENT.map((step, index) => (
                            <div key={index} className="text-center">
                                <div className="mx-auto">{step.icon}</div>
                                <h4 className="text-xl font-semibold text-gray-800 mb-2">{step.title}</h4>
                                <p className="text-gray-600">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-gray-900 mb-4">
                            Key Features
                        </h3>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Explore the powerful features designed to boost your interview skills
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {FEATURES_CONTENT.map((feature, index) => (
                            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200">
                                <CardHeader>
                                    <div className="mx-auto mb-4">{feature.icon}</div>
                                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
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
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-4xl font-bold text-gray-900 mb-6">
                                Unlock Your Potential with AI Interview Practice
                            </h3>
                            <p className="text-lg text-gray-600 mb-8">
                                Our comprehensive platform provides all the tools and insights
                                you need to excel in any interview situation.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {BENEFITS_CONTENT.map((benefit, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                        <span className="text-gray-700">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Card className="p-6 shadow-md">
                                <div className="flex items-center space-x-4">
                                    <Users className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Multiple Interview Types</h4>
                                        <p className="text-gray-600">Technical, behavioral, and case study interviews</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6 shadow-md">
                                <div className="flex items-center space-x-4">
                                    <Award className="h-8 w-8 text-green-600" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Personalized Feedback</h4>
                                        <p className="text-gray-600">AI-powered analysis of your performance</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6 shadow-md">
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

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-gradient-to-br from-blue-50 to-purple-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                        Choose Your Plan
                    </h2>
                    <p className="text-center text-gray-600 mb-14 text-lg">
                        Start for free, or upgrade for unlimited AI interview practice
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                        {PRICING_PLANS.map((plan, index) => (
                            <div
                                key={index}
                                className={`rounded-3xl shadow-lg p-8 border relative hover:shadow-2xl transition-all duration-300 ${plan.borderColor} ${plan.highlighted ? 'border-4 scale-105' : ''}`}
                            >
                                {plan.highlighted && (
                                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-4 py-1 rounded-full font-bold shadow">
                                        Most Popular
                                    </span>
                                )}
                                <h3 className={`text-2xl font-semibold mb-3 text-left ${plan.textColor}`}>{plan.name}</h3>
                                <div className="text-5xl font-bold mb-1 text-left">{plan.price}</div>
                                <div className="text-gray-500 mb-6 text-left">{plan.frequency}</div>
                                <ul className="text-gray-700 mb-8 space-y-2 text-sm text-left leading-relaxed">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} dangerouslySetInnerHTML={{ __html: feature }} />
                                    ))}
                                </ul>
                                <Button
                                    className={`w-full py-3 px-5 rounded-xl text-white font-semibold transition ${plan.buttonBgColor}`}
                                    onClick={handlePricingClick}
                                >
                                    {plan.buttonText}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-20 bg-gradient-to-br from-purple-100 to-blue-200">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8">Ready to Ace Your Next Interview?</h2>
                    <p className="text-xl text-gray-600 mb-10">
                        Join thousands of successful candidates who have used our AI Interview Coach to prepare and land their dream jobs.
                    </p>
                    <Button
                        onClick={() => navigate('/signup')}
                        size="lg"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-10 py-4 rounded-full shadow-md"
                    >
                        Start Your Free Trial Today
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </section>

            {/* Rating & Reviews Section */}
            <section className="py-20 bg-gray-100 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
                        What Our Users Say
                    </h2>

                    {/* Scrolling Wrapper */}
                    <div className="relative">
                        <div className="overflow-hidden">
                            <div className="flex space-x-6 animate-marquee w-max">
                                {TESTIMONIALS_CONTENT.map((testimonial, idx) => (
                                    <div
                                        key={idx}
                                        className="min-w-[280px] max-w-sm bg-white border border-gray-200 rounded-2xl shadow-md p-6 flex-shrink-0"
                                    >
                                        <div className="flex items-center mb-4">
                                            <img
                                                className="h-10 w-10 rounded-full object-cover mr-3"
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {testimonial.name}
                                                </p>
                                                <p className="text-xs text-gray-500">Verified User</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 text-sm mb-4">
                                            “{testimonial.review}”
                                        </p>
                                        <div className="flex">
                                            {[...Array(5)].map((_, starIdx) => (
                                                <svg
                                                    key={starIdx}
                                                    className="h-4 w-4 text-yellow-400"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.975a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.286 3.974c.3.922-.755 1.688-1.538 1.118l-3.39-2.46a1 1 0 00-1.176 0l-3.39 2.46c-.783.57-1.838-.196-1.538-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.045 9.402c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.975z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
            {/* Admin Dialog */}
            <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
                <DialogTrigger asChild></DialogTrigger>
                <DialogContent className="max-w-full md:max-w-7xl overflow-x-auto">
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
                                <div className="overflow-x-auto">
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
                                </div>
                                {interviews.length === 0 && (
                                    <div className="text-gray-500 text-center py-8">No interviews found.</div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            {/* UPI QR Modal */}
            <HeadlessDialog open={upiModalOpen} onClose={() => setUpiModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen">
                    <HeadlessDialog.Panel className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full text-center">
                        <HeadlessDialog.Title className="text-xl font-bold mb-2">Scan to Pay with UPI</HeadlessDialog.Title>
                        <p className="mb-4">Scan this QR code with any UPI app to pay ₹{amount}</p>
                        <QRCodeSVG value={upiUrl} size={200} />
                        <div className="mt-4">
                            <p className="text-sm text-gray-600 break-all">{upiUrl}</p>
                        </div>
                        <div className="mt-6 flex justify-center gap-4">
                            <button
                                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                                onClick={() => {
                                    setShowTxnInput(false);
                                    setUpiModalOpen(false);
                                }}
                            >
                                Close
                            </button>
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                onClick={() => setShowTxnInput(true)}
                            >
                                Paid
                            </button>
                        </div>
                        {showTxnInput && (
                            <div className="mt-6 space-y-3">
                                <input
                                    type="text"
                                    placeholder="Enter your UPI Transaction ID"
                                    value={txnId}
                                    onChange={e => setTxnId(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                />
                                <button
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    onClick={sendTxnEmail}
                                    disabled={sending || !txnId}
                                >
                                    {sending ? 'Sending...' : 'Submit'}
                                </button>
                            </div>
                        )}
                    </HeadlessDialog.Panel>
                </div>
            </HeadlessDialog>
            {/* Payment Form Modal */}
            <PaymentFormModal
                open={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                upiUrl={upiUrl}
                onSubmit={handlePaymentSubmit}
                loading={paymentLoading}
            />
        </div>
    );
};

export default Index;