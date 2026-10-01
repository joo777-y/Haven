"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const SESSION_STORAGE_KEY = "haven_intro_seen";

export default function HavenIntro() {
  // Start with true so SSR and initial HTML frame immediately cover the viewport with zero website flash
  const [shouldRender, setShouldRender] = useState<boolean>(true);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  const completeIntro = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
    } catch {
      // Ignore private browsing storage restrictions
    }
    setShouldRender(false);
  }, []);

  useEffect(() => {
    const isDev = process.env.NODE_ENV === "development";
    const search = typeof window !== "undefined" ? window.location.search : "";
    const isExplicitReplay = search.includes("intro") || search.includes("reset");

    if (isExplicitReplay) {
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {}
    }

    // In production, respect the once-per-session rule.
    // In dev mode, keep playing on refresh for effortless development and testing.
    if (!isDev && !isExplicitReplay) {
      try {
        const alreadySeen = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (alreadySeen === "true") {
          setShouldRender(false);
          return;
        }
      } catch {
        return;
      }
    }

    // Exact 2.5-second total timeline:
    // 0ms - 1900ms: Solid opaque canvas with brand mark and typography animating in and holding in stillness.
    // 1900ms - 2500ms (0.6s): Smooth dissolve & scale transition revealing the website underneath.
    // 2500ms: Overlay unmounts completely.
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 1900);

    const unmountTimer = setTimeout(() => {
      completeIntro();
    }, 2500);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        completeIntro();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(unmountTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [completeIntro]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      id="haven-intro-overlay"
      role="presentation"
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-[#f7f6f2] select-none ${
        isExiting
          ? "animate-haven-overlay-out pointer-events-none"
          : "pointer-events-auto"
      }`}
      style={{
        backgroundColor: "#f7f6f2",
      }}
    >
      {/* 1. Warm Atmospheric Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(194,109,69,0.07)_0%,transparent_65%)] pointer-events-none" />

      {/* 2. Architectural Dot Matrix Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#c26d45_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.08] pointer-events-none" />

      {/* 3. Centered Brand Composition */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg mx-auto">
        {/* Brand Mark / Logo Icon */}
        <div className="animate-haven-content-logo mb-6">
          <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white p-2.5 shadow-card border border-[#e6e4dd]">
            <Image
              src="/favicon.ico"
              alt="HAVEN Logo"
              width={48}
              height={48}
              priority
              unoptimized
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Brand Title: HAVEN ● */}
        <div className="animate-haven-content-title flex items-center justify-center">
          <span
            className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[0.25em] pl-[0.25em] text-[#1e2022]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            HAVEN
          </span>
          <span className="text-[#c26d45] text-base sm:text-lg -ml-1 sm:-ml-2 select-none">
            ●
          </span>
        </div>

        {/* Editorial Sub-label */}
        <div className="animate-haven-content-sub mt-2.5">
          <p
            className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.32em] text-[#c26d45] pl-[0.32em]"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Real Estate Platform
          </p>
        </div>

        {/* Hairline Accent Divider */}
        <div className="animate-haven-content-divider w-12 h-px bg-[#c26d45]/40 my-5 origin-center" />

        {/* Brand Statement / Slogan */}
        <div className="animate-haven-content-quote max-w-sm sm:max-w-md mx-auto">
          <p
            className="italic text-base sm:text-lg md:text-xl text-[#44474a] font-normal tracking-wide"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            &ldquo;Discover places worth calling home.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
