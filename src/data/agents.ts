import { Agent } from "@/components/agents/AgentCard";

export interface AgentDetail extends Agent {
  bio: string;
  experienceYears: number;
  salesVolume: string;
  specialties: string[];
}

export const mockAgents: AgentDetail[] = [
  {
    id: "agent-1",
    name: "Eleanor Vance",
    slug: "eleanor-vance",
    title: "Senior Architectural Advisor",
    agency: "HAVEN Private Estates",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    listingCount: 8,
    phone: "+1 (310) 555-0192",
    email: "eleanor.vance@havenrealestate.com",
    bio: "With over 14 years specializing in California mid-century modern and contemporary luxury estates, Eleanor guides discerning clients through private off-market acquisitions and architectural portfolio management.",
    experienceYears: 14,
    salesVolume: "$350M+",
    specialties: ["Architectural Properties", "Beverly Hills", "Private Sales"],
  },
  {
    id: "agent-2",
    name: "Julian Sterling",
    slug: "julian-sterling",
    title: "Principal Broker & Founder",
    agency: "Sterling & Partners",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    listingCount: 12,
    phone: "+1 (415) 555-0144",
    email: "julian@sterlingpartners.com",
    bio: "Julian brings a background in structural architecture and urban design to real estate brokerage, offering clients unmatched technical insight into iconic residential structures.",
    experienceYears: 18,
    salesVolume: "$500M+",
    specialties: ["Modernist Estates", "Desert Architecture", "Urban Planning"],
  },
  {
    id: "agent-3",
    name: "Sophia Martinez",
    slug: "sophia-martinez",
    title: "Luxury Waterfront Specialist",
    agency: "HAVEN Coastal Group",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    listingCount: 6,
    phone: "+1 (305) 555-0188",
    email: "sophia.m@havencoastal.com",
    bio: "Specializing in prime oceanfront villas in Malibu, Miami Beach, and coastal enclaves, Sophia delivers white-glove advisory services for high-net-worth international clients.",
    experienceYears: 10,
    salesVolume: "$220M+",
    specialties: ["Waterfront Estates", "Coastal Mansions", "Penthouse Sales"],
  },
];
