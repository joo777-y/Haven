"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Building2, ShieldCheck, Award } from "lucide-react";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import HeroSearchBar from "@/components/home/HeroSearchBar";
import PropertyGrid from "@/components/properties/PropertyGrid";
import LifestyleCard from "@/components/home/LifestyleCard";
import AgentCard from "@/components/agents/AgentCard";
import { mockHomeData } from "@/data/home";
import { mockProperties } from "@/data/properties";
import { mockAgents } from "@/data/agents";
import { mockCategories } from "@/data/categories";

export default function Home() {
  const featuredProperties = mockProperties.filter((p) =>
    mockHomeData.featuredPropertyIds.includes(p.id)
  );

  const featuredAgents = mockAgents.filter((a) =>
    mockHomeData.featuredAgentIds.includes(a.id)
  );

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col justify-between pt-12 pb-16 overflow-hidden bg-[#f3f1eb]">
        {/* Subtle Background Pattern & Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#c26d45_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.15]" />
        
        <Container className="relative z-10 flex flex-col items-center text-center my-auto pt-8">
          <Badge variant="secondary" size="md" className="mb-6 tracking-widest uppercase">
            {mockHomeData.hero.tagline}
          </Badge>

          <h1 className="max-w-4xl font-display text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-primary leading-[1.1]">
            {mockHomeData.hero.headline}
          </h1>

          <p className="mt-6 max-w-2xl font-sans text-base sm:text-lg leading-relaxed text-muted">
            {mockHomeData.hero.subheadline}
          </p>

          {/* Hero Search Bar */}
          <div className="mt-10 w-full flex justify-center">
            <HeroSearchBar />
          </div>
        </Container>

        {/* Stats Strip */}
        <Container className="relative z-10 mt-16 pt-8 border-t border-divider/60">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {mockHomeData.stats.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <span className="font-display text-3xl sm:text-4xl font-bold text-primary">
                  {stat.value}
                </span>
                <h4 className="font-sans text-xs font-bold text-secondary uppercase tracking-wider">
                  {stat.label}
                </h4>
                <p className="text-[11px] text-muted max-w-[180px] mx-auto hidden sm:block">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured Properties Section */}
      <section>
        <Container>
          <SectionHeading
            subtitle="Curated Portfolio"
            title="Featured Residences & Estates"
            description="Hand-selected architectural sanctuaries offering extraordinary design and unmatched locations."
            action={
              <Link href="/properties">
                <Button variant="outline" size="md">
                  <span>View All Properties</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            }
          />

          <PropertyGrid properties={featuredProperties} />
        </Container>
      </section>

      {/* Explore by Architecture & Lifestyle */}
      <section className="bg-surface py-20 border-y border-divider/60">
        <Container>
          <SectionHeading
            subtitle="Curated Lifestyles"
            title="Explore by Architecture & Living"
            description="Discover homes crafted for your lifestyle—from mid-century modernist icons to oceanfront retreats."
            align="left"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockCategories.map((category) => (
              <LifestyleCard key={category.id} category={category} />
            ))}
          </div>
        </Container>
      </section>

      {/* Featured Agents Section */}
      <section>
        <Container>
          <SectionHeading
            subtitle="Advisory Excellence"
            title="Meet Our Principal Advisors"
            description="Licensed private brokers specializing in architectural preservation, waterfront acquisitions, and off-market luxury."
            action={
              <Link href="/agents">
                <Button variant="outline" size="md">
                  <span>View All Advisors</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </Container>
      </section>

      {/* Testimonial / Brand Trust Section */}
      <section className="bg-[#1e2022] text-white py-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Sparkles className="h-8 w-8 text-secondary mx-auto" />
            <blockquote className="font-display text-2xl sm:text-3xl font-normal leading-relaxed italic text-surface/90">
              "{mockHomeData.testimonials[0].quote}"
            </blockquote>
            <div>
              <h5 className="font-sans text-sm font-semibold text-white">
                {mockHomeData.testimonials[0].author}
              </h5>
              <p className="font-sans text-xs text-secondary mt-0.5">
                {mockHomeData.testimonials[0].role} • {mockHomeData.testimonials[0].location}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Call to Action Banner */}
      <section>
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-secondary/10 border border-secondary/20 p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl text-center md:text-left">
              <Badge variant="secondary" size="md">
                Private Advisory
              </Badge>
              <h3 className="font-display text-3xl font-semibold text-primary">
                Are you looking to acquire or sell an architectural masterpiece?
              </h3>
              <p className="font-sans text-sm text-muted leading-relaxed">
                Connect with our concierge team for confidential consultations and exclusive off-market listings.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/contact">
                <Button variant="primary" size="lg">
                  <span>Contact Advisory Team</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/properties">
                <Button variant="outline" size="lg">
                  Browse Listings
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}