"use client";

import { useState, useMemo } from "react";
import AgentCard, { type Agent } from "./AgentCard";
import Input from "@/components/ui/Input";
import { Search } from "lucide-react";

interface AgentDirectoryProps {
  initialAgents: Agent[];
}

export default function AgentDirectory({ initialAgents }: AgentDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return initialAgents;
    const query = searchQuery.toLowerCase();
    return initialAgents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query) ||
        agent.agency.toLowerCase().includes(query) ||
        agent.title.toLowerCase().includes(query)
    );
  }, [initialAgents, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          placeholder="Search agent by name or brokerage..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-4 w-4 text-muted" />}
          aria-label="Search licensed advisors by name or agency"
        />
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="rounded-2xl border border-dashed border-divider bg-surface/50 p-12 text-center space-y-2">
          <p className="font-display text-base font-semibold text-foreground">
            No advisors match &quot;{searchQuery}&quot;
          </p>
          <p className="text-xs text-muted">
            Try searching by a different name, agency, or title.
          </p>
        </div>
      )}
    </div>
  );
}
