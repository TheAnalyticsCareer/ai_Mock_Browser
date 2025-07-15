import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/ui/Footer";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you can add logic to send the message to your backend or email service
  };

  return (
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
      <div className="max-w-2xl mx-auto py-12 px-4">
        <p className="mb-6">Have questions or feedback? Fill out the form below and we'll get back to you soon.</p>
        {submitted ? (
          <div className="bg-green-100 text-green-800 p-4 rounded mb-4">Thank you for contacting us! We'll respond as soon as possible.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Name</label>
              <input
                name="name"
                className="w-full border rounded px-3 py-2"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                name="email"
                type="email"
                className="w-full border rounded px-3 py-2"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Message</label>
              <textarea
                name="message"
                className="w-full border rounded px-3 py-2"
                rows={5}
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Contact;