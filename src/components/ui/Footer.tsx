import { Link } from "react-router-dom";
import {
  Home,
  ListChecks,
  UserPlus,
  LogIn,
  ShieldCheck,
  Mail,
  Linkedin,
} from "lucide-react";

const Footer = () => (
  <footer className="bg-gray-900 text-white py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {/* Column 1: About Us */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <img
            src="https://d502jbuhuh9wk.cloudfront.net/logos/6677da88a7c70751b1bf34a8.png?v=1"
            alt="Logo"
            className="h-12 w-12 object-contain"
          />
          <span className="text-xl font-semibold">Analytics Career</span>
        </div>
        <p className="text-gray-400 text-sm">
          Your go-to platform for mastering analytics interviews. Practice,
          learn, and land your dream job.
        </p>
        <div className="flex space-x-4">
          <a
            href="https://www.linkedin.com/company/analyticscareer/posts/?feedView=all"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-300 transition"
          >
            <Linkedin className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
          </a>
          <a
            href="mailto:careeranalytics499@gmail.com"
            title="careeranalytics499@gmail.com"
            className="text-gray-400 hover:text-blue-300 transition"
          >
            <Mail className="h-5 w-5" />
            <span className="sr-only">Email</span>
          </a>
        </div>
      </div>

      {/* Column 2: Quick Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
        <nav className="space-y-2">
          <Link
            to="/"
            className="hover:text-blue-300 transition flex items-center space-x-2"
          >
            <Home className="h-4 w-4" /> <span>Home</span>
          </Link>
          <Link
            to="/dashboard"
            className="hover:text-blue-300 transition flex items-center space-x-2"
          >
            <ListChecks className="h-4 w-4" /> <span>Dashboard</span>
          </Link>
          <Link
            to="/login"
            className="hover:text-blue-300 transition flex items-center space-x-2"
          >
            <LogIn className="h-4 w-4" /> <span>Login</span>
          </Link>
          <Link
            to="/signup"
            className="hover:text-blue-300 transition flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" /> <span>Sign Up</span>
          </Link>
        </nav>
      </div>

      {/* Column 3: More */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">More</h3>
        <nav className="space-y-2">
          <Link
            to="/privacy"
            className="hover:text-blue-300 transition flex items-center space-x-2"
          >
            <ShieldCheck className="h-4 w-4" /> <span>Privacy Policy</span>
          </Link>
          <Link
            to="/terms"
            className="hover:text-blue-300 transition flex items-center space-x-2"
          >
            <span>Terms of Service</span>
          </Link>
          <Link
            to="/contact"
            className="hover:text-blue-300 transition flex items-center space-x-2"
          >
            <Mail className="h-4 w-4" /> <span>Contact Us</span>
          </Link>
        </nav>
      </div>

      {/* Column 4: Newsletter */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">
          Subscribe to our Newsletter
        </h3>
        <p className="text-gray-400 text-sm">
          Stay updated with the latest interview tips and platform updates.
        </p>
        <div className="mt-2">
          <input
            type="email"
            className="bg-gray-800 border border-gray-700 rounded-md py-2 px-4 w-full text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your email address"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md py-2 w-full mt-2 transition">
            Subscribe
          </button>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 border-t border-gray-800 py-4 text-center text-gray-400 text-sm">
      © {new Date().getFullYear()} Analytics Career. All rights reserved.
    </div>
  </footer>
);

export default Footer;
