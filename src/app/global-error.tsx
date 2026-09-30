"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical root error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-[#161922] p-8 text-center shadow-2xl space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              HAVEN Critical Failure
            </span>
            <h1 className="text-2xl font-bold text-white">
              Application Encountered an Issue
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              A critical error occurred while rendering the page. You can reload
              the page or return to the safe homepage.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#D4AF37] text-black font-semibold text-xs tracking-wider uppercase hover:bg-[#C29D26] transition-all"
            >
              Reload Page
            </button>
            <a
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-white/20 text-white font-medium text-xs tracking-wider uppercase hover:bg-white/5 transition-all text-center"
            >
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
