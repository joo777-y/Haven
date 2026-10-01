"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail("");
    }
  };

  if (isSubscribed) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-xs font-medium text-secondary">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>Welcome to the Dispatch. You are now subscribed.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="flex items-center max-w-sm">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        aria-label="Email address for newsletter"
        className="w-full rounded-l-xl border border-r-0 border-divider/80 bg-[#eae8e1]/70 px-4 py-3 text-xs text-foreground placeholder:text-muted/70 focus:border-primary focus:outline-none transition-colors"
      />
      <button
        type="submit"
        className="rounded-r-xl bg-primary px-6 py-3 font-sans text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-secondary/40"
      >
        Join
      </button>
    </form>
  );
}
