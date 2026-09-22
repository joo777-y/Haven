"use client";

import { useState } from "react";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

const topicOptions = [
  { value: "buying", label: "Property Acquisition / Buying" },
  { value: "selling", label: "Listing / Selling an Estate" },
  { value: "advisory", label: "Private Off-Market Advisory" },
  { value: "press", label: "Press & Media Inquiries" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-16 space-y-16">
      <Container>
        <SectionHeading
          subtitle="Get in Touch"
          title="Connect with Our Advisory Concierge"
          description="Whether you are seeking private off-market access or looking to showcase your architectural estate, our team is at your disposal."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-6">
          {/* Contact Details Column */}
          <div className="space-y-8">
            <div className="rounded-2xl border border-divider bg-surface p-6 space-y-6">
              <h3 className="font-display text-lg font-semibold text-primary">
                Global Headquarters
              </h3>

              <div className="space-y-4 text-xs text-muted">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-primary block">Beverly Hills Flagship</span>
                    <span>1042 Wilshire Blvd, Suite 800</span>
                    <span className="block">Beverly Hills, CA 90210</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-secondary shrink-0" />
                  <span>+1 (310) 555-0192</span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-secondary shrink-0" />
                  <span>concierge@havenrealestate.com</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-divider bg-background p-6 space-y-2">
              <Badge variant="secondary" size="sm">
                Off-Market Desk
              </Badge>
              <h4 className="font-display text-base font-semibold text-primary">
                Private Buyers & Sellers
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                For confidential high-net-worth acquisitions, call our dedicated private line at +1 (800) 555-HAVEN.
              </p>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-2 rounded-3xl border border-divider bg-surface p-8 sm:p-10 shadow-xs">
            {submitted ? (
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
            ) : (
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
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}