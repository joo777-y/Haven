"use client";

import { use } from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PropertyGrid from "@/components/properties/PropertyGrid";
import { mockAgents } from "@/data/agents";
import { mockProperties } from "@/data/properties";
import { ArrowLeft, Building, Phone, Mail, Award, Briefcase, CheckCircle2 } from "lucide-react";

export default function AgentDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const agent = mockAgents.find((a) => a.slug === slug) || mockAgents[0];
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
              <img
                src={agent.avatar}
                alt={agent.name}
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
            <div className="w-full md:w-auto shrink-0 space-y-3">
              <a href={`tel:${agent.phone}`}>
                <Button variant="primary" size="md" className="w-full gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Call {agent.phone}</span>
                </Button>
              </a>
              <a href={`mailto:${agent.email}`}>
                <Button variant="outline" size="md" className="w-full gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Email Advisor</span>
                </Button>
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