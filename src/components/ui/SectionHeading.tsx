import React from "react";

interface SectionHeadingProps {
  subtitle?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeading({
  subtitle,
  title,
  description,
  action,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const alignStyles = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 ${className}`}>
      <div className={`max-w-2xl ${alignStyles}`}>
        {subtitle && (
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-secondary block mb-2">
            {subtitle}
          </span>
        )}
        <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-primary leading-tight">
          {title}
        </h2>
        {description && (
          <p className="font-sans text-sm sm:text-base text-muted leading-relaxed mt-3">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
