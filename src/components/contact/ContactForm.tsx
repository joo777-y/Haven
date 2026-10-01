"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Send, CheckCircle2 } from "lucide-react";

const topicOptions = [
  { value: "buying", label: "Property Acquisition / Buying" },
  { value: "selling", label: "Listing / Selling an Estate" },
  { value: "advisory", label: "Private Off-Market Advisory" },
  { value: "press", label: "Press & Media Inquiries" },
];

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="py-12 text-center space-y-4">
        <CheckCircle2 className="h-14 w-14 text-secondary mx-auto" />
        <h3 className="font-display text-2xl font-semibold text-primary">
          Message Received
        </h3>
        <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
          Thank you for reaching out to HAVEN. A private advisory manager will contact you within 24 hours.
        </p>
        <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="First Name" placeholder="Jane" required />
        <Input label="Last Name" placeholder="Doe" required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Email Address" type="email" placeholder="jane@example.com" required />
        <Input label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" />
      </div>

      <Select label="Inquiry Topic" options={topicOptions} />

      <div className="space-y-1.5">
        <label className="block font-sans text-xs font-semibold text-primary">
          Message / Request Details
        </label>
        <textarea
          rows={4}
          placeholder="Tell us about your property requirements or advisory needs..."
          required
          className="w-full rounded-lg border border-divider bg-surface p-3 font-sans text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </div>

      <Button type="submit" variant="primary" size="md" className="gap-2">
        <Send className="h-4 w-4" />
        <span>Submit Inquiry</span>
      </Button>
    </form>
  );
}
