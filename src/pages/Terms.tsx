import Footer from "@/components/ui/Footer";
import { Link } from "react-router-dom";

const Terms = () => (
  <>
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <Link to="/">
            <img
              src="https://d502jbuhuh9wk.cloudfront.net/logos/6677da88a7c70751b1bf34a8.png?v=1"
              alt="Logo"
              className="h-10 w-10 rounded"
            />
          </Link>
          <span className="text-xl font-bold text-gray-900">AI Interviewer</span>
        </div>
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-6">
          <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
            Dashboard
          </Link>
          
        </nav>
      </div>
    </header>
    <div className="max-w-3xl mx-auto py-12 px-4">
      <p className="mb-4">By using this platform, you agree to the following terms:</p>
      <ul className="list-disc ml-6 mb-4">
        <li>You will use the service for lawful purposes only.</li>
        <li>You are responsible for maintaining the confidentiality of your account.</li>
        <li>We reserve the right to suspend accounts for misuse or abuse.</li>
        <li>All content and feedback generated is for personal use and not for redistribution.</li>
        <li>We may update these terms at any time. Continued use means acceptance of changes.</li>
      </ul>
      <p>For questions, please <a href="/contact" className="text-blue-600 underline">Contact Us</a>.</p>
    </div>
    <Footer />
  </>
);

export default Terms;