import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Badge from "@/components/ui/Badge";
import ContactForm from "@/components/contact/ContactForm";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact & Private Advisory | HAVEN",
  description:
    "Connect with the HAVEN Advisory Concierge for private off-market property acquisition, architectural representation, and discreet consultations.",
};

export default function ContactPage() {
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
            <ContactForm />
          </div>
        </div>
      </Container>
    </div>
  );
}