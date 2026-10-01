import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import Badge from "@/components/ui/Badge";
import HavenImage from "@/components/ui/HavenImage";
import PropertyGrid from "@/components/properties/PropertyGrid";
import { mockAgents } from "@/data/agents";
import { mockProperties } from "@/data/properties";
import { ArrowLeft, Phone, Mail } from "lucide-react";

interface AgentDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: AgentDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agent = mockAgents.find((a) => a.slug === slug);

  if (!agent) {
    return {
      title: "Advisor Not Found | HAVEN",
      description: "The requested architectural advisor could not be found.",
    };
  }

  return {
    title: `${agent.name} — ${agent.title} | HAVEN`,
    description: agent.bio.slice(0, 160),
  };
}

export default async function AgentDetailsPage({
  params,
}: AgentDetailsPageProps) {
  const { slug } = await params;
  const agent = mockAgents.find((a) => a.slug === slug);

  if (!agent) {
    notFound();
  }

  const agentProperties = mockProperties.filter((p) => p.agentId === agent.id);

  return (
    <div className="py-12 space-y-12">
      <Container>
        {/* Back Link */}
        <Link
          href="/agents"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Advisors Directory</span>
        </Link>

        {/* Profile Card Header */}
        <div className="rounded-3xl border border-divider bg-surface p-8 sm:p-10 space-y-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar */}
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border border-divider bg-background">
              <HavenImage
                src={agent.avatar}
                alt={agent.name}
                preset="thumbnail"
                containerClassName="h-full w-full rounded-full"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Main Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-semibold text-primary">
                  {agent.name}
                </h1>
                <Badge variant="secondary">Verified Advisor</Badge>
              </div>

              <p className="font-sans text-sm text-muted">
                {agent.title} • <span className="text-secondary font-medium">{agent.agency}</span>
              </p>

              <p className="font-sans text-sm text-muted/90 leading-relaxed max-w-2xl pt-2">
                {agent.bio}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {agent.specialties.map((spec, idx) => (
                  <Badge key={idx} variant="outline" size="sm">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Contact Action */}
            <div id="contact" className="w-full md:w-auto shrink-0 space-y-3">
              <a
                href={`tel:${agent.phone}`}
                className="w-full inline-flex items-center justify-center font-sans font-semibold transition-all duration-200 cursor-pointer bg-primary text-white hover:opacity-90 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 px-5 py-2.5 text-sm rounded-lg gap-2"
              >
                <Phone className="h-4 w-4" />
                <span>Call {agent.phone}</span>
              </a>
              <a
                href={`mailto:${agent.email}`}
                className="w-full inline-flex items-center justify-center font-sans font-semibold transition-all duration-200 cursor-pointer border border-divider bg-surface text-primary hover:border-primary/40 hover:bg-background active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 px-5 py-2.5 text-sm rounded-lg gap-2"
              >
                <Mail className="h-4 w-4" />
                <span>Email Advisor</span>
              </a>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="pt-8 border-t border-divider/60 grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-xs text-muted block">Experience</span>
              <span className="font-display text-xl font-bold text-primary">
                {agent.experienceYears} Years
              </span>
            </div>
            <div>
              <span className="text-xs text-muted block">Career Sales</span>
              <span className="font-display text-xl font-bold text-primary">
                {agent.salesVolume}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted block">Active Listings</span>
              <span className="font-display text-xl font-bold text-primary">
                {agent.listingCount} Properties
              </span>
            </div>
          </div>
        </div>

        {/* Agent Active Properties Section */}
        <div className="space-y-8 pt-8">
          <h2 className="font-display text-2xl font-semibold text-primary">
            Active Properties by {agent.name}
          </h2>
          <PropertyGrid properties={agentProperties} />
        </div>
      </Container>
    </div>
  );
}