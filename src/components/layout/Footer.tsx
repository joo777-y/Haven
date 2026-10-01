"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "./Container";
import { Home, Camera, BookOpen, AtSign, CheckCircle2 } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-divider bg-background pt-16 pb-12">
      <Container>
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6 pb-14 border-b border-divider/60">
          {/* Brand & Newsletter Column (Spans 2 columns on lg) */}
          <div className="lg:col-span-2 space-y-6 pr-0 lg:pr-6">
            {/* Logo */}
            <Link
              href="/"
              className="font-display text-2xl font-semibold tracking-tight text-primary flex items-center"
            >
              HAVEN
              <span className="text-secondary ml-1.5 text-base select-none">●</span>
            </Link>

            {/* Description */}
            <p className="font-sans text-sm text-muted/90 leading-relaxed max-w-md">
              An editorial discovery platform curating timeless architectural properties, mid-century sanctuaries, and visionary residences across the world.
            </p>

            {/* Newsletter Section */}
            <div className="space-y-3 pt-2">
              <h4 className="font-sans text-xs font-bold text-primary tracking-tight">
                Subscribe to The Architectural Dispatch
              </h4>

              {isSubscribed ? (
                <div className="flex items-center gap-2 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-xs font-medium text-secondary">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Welcome to the Dispatch. You are now subscribed.</span>
                </div>
              ) : (
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
              )}

              <p className="text-[11px] text-muted/70">
                Discreet monthly insights. No spam.
              </p>
            </div>
          </div>

          {/* Discover Column */}
          <div className="space-y-4">
            <h4 className="font-display text-base font-semibold text-primary">
              Discover
            </h4>
            <ul className="space-y-3 text-xs font-normal text-muted">
              <li>
                <Link href="/properties?type=sale&category=villa" className="hover:text-primary transition-colors">
                  Villas for Sale (Buy)
                </Link>
              </li>
              <li>
                <Link href="/properties?type=rent&category=villa" className="hover:text-primary transition-colors">
                  Villas for Rent
                </Link>
              </li>
              <li>
                <Link href="/properties?category=penthouse" className="hover:text-primary transition-colors">
                  Penthouses & Lofts
                </Link>
              </li>
              <li>
                <Link href="/properties?category=chalet" className="hover:text-primary transition-colors">
                  Coastal Sanctuaries
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h4 className="font-display text-base font-semibold text-primary">
              Company
            </h4>
            <ul className="space-y-3 text-xs font-normal text-muted">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/about#heritage" className="hover:text-primary transition-colors">
                  Heritage & Mission
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Advisory Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h4 className="font-display text-base font-semibold text-primary">
              Legal
            </h4>
            <ul className="space-y-3 text-xs font-normal text-muted">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  Cookie Preferences
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-4">
            <h4 className="font-display text-base font-semibold text-primary">
              Resources
            </h4>
            <ul className="space-y-3 text-xs font-normal text-muted">
              <li>
                <Link href="/properties" className="hover:text-primary transition-colors">
                  Property Portfolio
                </Link>
              </li>
              <li>
                <Link href="/agents" className="hover:text-primary transition-colors">
                  Advisor Directory
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Private Inquiries
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted/80 gap-4">
          {/* Left: Equal Housing */}
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-muted/80 shrink-0" />
            <span>Equal Housing Opportunity. Equal Access to Architectural Heritage.</span>
          </div>

          {/* Center: Dynamic Copyright */}
          <div>
            <span>© {new Date().getFullYear()} HAVEN Real Estate Platform. All rights reserved.</span>
          </div>

          {/* Right: Accessible Social Icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="HAVEN on Instagram"
              className="text-muted hover:text-primary transition-colors p-1"
            >
              <Camera className="h-4 w-4" />
            </a>
            <a
              href="https://substack.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="HAVEN Journal on Substack"
              className="text-muted hover:text-primary transition-colors p-1"
            >
              <BookOpen className="h-4 w-4" />
            </a>
            <a
              href="https://threads.net"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="HAVEN on Threads"
              className="text-muted hover:text-primary transition-colors p-1"
            >
              <AtSign className="h-4 w-4" />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
