"use client";

import Link from "next/link";
import { Building, ArrowUpRight } from "lucide-react";
import Button from "@/components/ui/Button";
import HavenImage from "@/components/ui/HavenImage";

export interface Agent {
  id: string;
  name: string;
  slug: string;
  title: string;
  agency: string;
  avatar: string;
  listingCount: number;
  phone?: string;
  email?: string;
}

export interface AgentCardProps {
  agent: Agent;
  onContactClick?: (agentId: string) => void;
  className?: string;
}

export default function AgentCard({
  agent,
  onContactClick,
  className = "",
}: AgentCardProps) {
  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-divider bg-surface p-6 transition-all duration-300 hover:border-secondary/40 hover:shadow-card ${className}`}
    >
      <div>
        {/* Top Info Header */}
        <div className="flex items-start gap-4">
          {/* Avatar Image */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-divider bg-background">
            <HavenImage
              src={agent.avatar}
              alt={agent.name}
              preset="thumbnail"
              containerClassName="h-full w-full rounded-full"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Name & Agency */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-semibold text-foreground truncate group-hover:text-secondary transition-colors">
              <Link href={`/agents/${agent.slug}`} className="focus:outline-none focus:underline">
                <span className="absolute inset-0 z-0" aria-hidden="true" />
                {agent.name}
              </Link>
            </h3>
            <p className="font-sans text-xs text-muted truncate mt-0.5">
              {agent.title}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-secondary font-medium">
              <Building className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{agent.agency}</span>
            </div>
          </div>
        </div>

        {/* Listings Badge */}
        <div className="mt-5 rounded-lg border border-divider/60 bg-background/60 px-3.5 py-2 flex items-center justify-between text-xs text-muted">
          <span>Active Listings</span>
          <span className="font-bold text-primary">{agent.listingCount} Properties</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-6 pt-4 border-t border-divider/60 flex items-center gap-2 z-10">
        {onContactClick ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-1.5 text-xs"
            onClick={() => onContactClick(agent.id)}
          >
            <span>Contact Agent</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Link
            href={`/agents/${agent.slug}#contact`}
            className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-md border border-divider bg-surface text-primary hover:border-primary/40 hover:bg-background active:scale-[0.99] transition-all"
          >
            <span>Contact Agent</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </article>
  );
}
