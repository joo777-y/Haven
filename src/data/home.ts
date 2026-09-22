export interface HeroStat {
  label: string;
  value: string;
  description: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  location: string;
}

export interface HomeData {
  hero: {
    headline: string;
    subheadline: string;
    tagline: string;
  };
  stats: HeroStat[];
  testimonials: Testimonial[];
  featuredPropertyIds: string[];
  featuredAgentIds: string[];
}

export const mockHomeData: HomeData = {
  hero: {
    tagline: "ARCHITECTURAL DISCOVERY PLATFORM",
    headline: "Discover Timeless Architectural Sanctuaries",
    subheadline:
      "Curating mid-century masterpieces, oceanfront sanctuaries, and visionary modern residences across premier global destinations.",
  },
  stats: [
    {
      value: "$4.2B+",
      label: "Portfolio Value",
      description: "Curated luxury real estate assets listed globally.",
    },
    {
      value: "150+",
      label: "Iconic Residences",
      description: "Hand-picked architectural properties and private estates.",
    },
    {
      value: "99.4%",
      label: "Client Satisfaction",
      description: "Seamless advisory for high-net-worth buyers & sellers.",
    },
    {
      value: "25+",
      label: "Global Markets",
      description: "Primary locations in California, New York, Texas, & Florida.",
    },
  ],
  testimonials: [
    {
      id: "test-1",
      quote:
        "HAVEN connected us with an off-market mid-century sanctuary in Palm Springs that exceeded every architectural detail we dreamed of.",
      author: "Marcus & Elena Thorne",
      role: "Private Collectors",
      location: "Beverly Hills, CA",
    },
    {
      id: "test-2",
      quote:
        "The level of curation and discretion provided by HAVEN’s network of advisors is unmatched in the luxury residential market.",
      author: "David Sterling",
      role: "Architectural Curator",
      location: "New York, NY",
    },
  ],
  featuredPropertyIds: ["prop-1", "prop-2", "prop-4"],
  featuredAgentIds: ["agent-1", "agent-2", "agent-3"],
};
