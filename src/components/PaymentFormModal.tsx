import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { QRCodeSVG } from "qrcode.react";

interface PaymentFormModalProps {
  open: boolean;
  onClose: () => void;
  upiUrl: string;
  onSubmit: (form: any) => void;
  loading?: boolean;
}

const PaymentFormModal = ({ open, onClose, upiUrl, onSubmit, loading }: PaymentFormModalProps) => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    experience: "",
    plan: "Free",
    txnId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Panel className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full text-center">
          <Dialog.Title className="text-xl font-bold mb-2">Complete Your Registration</Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              name="fullName"
              placeholder="Full Name"
              className="w-full border rounded px-3 py-2"
              value={form.fullName}
              onChange={handleChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full border rounded px-3 py-2"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              name="mobile"
              type="tel"
              placeholder="Mobile Number"
              className="w-full border rounded px-3 py-2"
              value={form.mobile}
              onChange={handleChange}
              required
            />
            <input
              name="experience"
              placeholder="Years of Experience"
              type="number"
              min={0}
              className="w-full border rounded px-3 py-2"
              value={form.experience}
              onChange={handleChange}
              required
            />

            <select
              name="plan"
              className="w-full border rounded px-3 py-2"
              value={form.plan}
              onChange={handleChange}
              required
            >
              <option value="Free">Free</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
              <option value="Student">Student</option>
            </select>

            <div className="my-4">
              <p className="mb-2">Scan to Pay with UPI</p>
              <QRCodeSVG value={upiUrl} size={180} />
            </div>

            <input
              name="txnId"
              placeholder="Enter your UPI Transaction ID"
              className="w-full border rounded px-3 py-2"
              value={form.txnId}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PaymentFormModal;
