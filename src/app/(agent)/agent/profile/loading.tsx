import { Loader2 } from "lucide-react";

export default function AgentProfileLoading() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-pulse">
      <div className="h-4 w-36 bg-surface rounded-md" />
      <div className="h-10 w-64 bg-surface rounded-md" />
      <div className="h-32 w-full bg-surface rounded-2xl" />
      <div className="h-72 w-full bg-surface rounded-2xl" />
    </div>
  );
}
