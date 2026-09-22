"use client";

import { useState, useMemo } from "react";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import AgentCard from "@/components/agents/AgentCard";
import Input from "@/components/ui/Input";
import { mockAgents } from "@/data/agents";
import { Search } from "lucide-react";

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = useMemo(() => {
    return mockAgents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="py-12 space-y-10">
      <Container>
        <SectionHeading
          subtitle="Advisory Network"
          title="Licensed Agents & Brokers"
          description="Connect with seasoned advisors specializing in luxury acquisitions, architectural preservation, and private sales."
        />

        {/* Search Bar */}
        <div className="max-w-md mb-8">
          <Input
            placeholder="Search agent by name or brokerage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-muted" />}
          />
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </Container>
    </div>
  );
}