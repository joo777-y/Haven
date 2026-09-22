import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { ShieldCheck, Compass, Sparkles, Building2, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="py-16 space-y-20">
      <Container>
        {/* Header Hero */}
        <div className="max-w-3xl space-y-4">
          <Badge variant="secondary">Our Heritage & Vision</Badge>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight text-primary leading-tight">
            Curating Extraordinary Architectural Heritage
          </h1>
          <p className="font-sans text-base sm:text-lg text-muted leading-relaxed">
            HAVEN was founded on a singular principle: that exceptional architectural homes are not merely real estate assets—they are living works of art.
          </p>
        </div>

        {/* Narrative Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-display text-3xl font-semibold text-primary">
              Where Design Meets Discretion
            </h2>
            <p className="font-sans text-sm text-muted leading-relaxed">
              Our editorial platform connects discerning global buyers with iconic mid-century sanctuaries, modern coastal estates, and off-market architectural gems.
            </p>
            <p className="font-sans text-sm text-muted leading-relaxed">
              Through tailored advisory services and deep partnerships with leading architectural preservationists, we ensure every transaction respects the structural integrity and legacy of the property.
            </p>
          </div>

          <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-divider bg-background">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
              alt="HAVEN Architecture"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Values Grid */}
        <div className="mt-20 pt-16 border-t border-divider">
          <SectionHeading
            subtitle="Core Pillars"
            title="What Defines HAVEN"
            description="Our commitment to excellence across design, advisory, and client confidentiality."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-divider bg-surface p-6 space-y-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-primary">
                Strict Curation
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Every property listed on HAVEN is hand-reviewed to meet rigorous architectural standards.
              </p>
            </div>

            <div className="rounded-2xl border border-divider bg-surface p-6 space-y-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-primary">
                Complete Discretion
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                We handle private off-market acquisitions with white-glove confidentiality for our high-net-worth clients.
              </p>
            </div>

            <div className="rounded-2xl border border-divider bg-surface p-6 space-y-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-tertiary/10 text-tertiary">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-primary">
                Advisory Integrity
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Our advisors possess deep expertise in modernist heritage, structural design, and market analysis.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}