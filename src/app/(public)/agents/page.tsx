import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import AgentDirectory from "@/components/agents/AgentDirectory";
import { mockAgents } from "@/data/agents";

export const metadata: Metadata = {
  title: "Advisory Network & Brokers | HAVEN",
  description:
    "Connect with seasoned advisors specializing in luxury acquisitions, architectural preservation, and private sales.",
};

export default function AgentsPage() {
  return (
    <div className="py-12 space-y-10">
      <Container>
        <SectionHeading
          subtitle="Advisory Network"
          title="Licensed Agents & Brokers"
          description="Connect with seasoned advisors specializing in luxury acquisitions, architectural preservation, and private sales."
        />

        <AgentDirectory initialAgents={mockAgents} />
      </Container>
    </div>
  );
}