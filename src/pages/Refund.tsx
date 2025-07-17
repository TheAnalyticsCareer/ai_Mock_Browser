import Footer from "@/components/ui/Footer";
import { Link } from "react-router-dom";

const Refund = () => (
  <>
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
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
        <nav className="flex items-center gap-6">
          <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
      <div className="overflow-y-auto max-h-[70vh] p-4 border rounded bg-white text-gray-800 text-sm space-y-4">
        <p>
          Thank you for shopping at <strong>theanalyticscareer.graphy.com</strong>
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">Non-tangible irrevocable goods ("Digital products")</h2>
        <p>
          We do not issue refunds for non-tangible irrevocable goods ("digital products") once the order is confirmed and the product is sent.
        </p>
        <p>
          We recommend contacting us for assistance if you experience any issues receiving or downloading our products.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">Contact us for any issues:</h2>
        <p>
          If you have any questions about our Returns and Refunds Policy, please contact us at:{" "}
          <a href="mailto:theanalyticscareer@gmail.com" className="text-blue-600 underline">
            theanalyticscareer@gmail.com
          </a>
        </p>
      </div>
    </main>
    <Footer />
  </>
);

export default Refund;