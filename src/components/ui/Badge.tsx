import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "outline" | "surface";
  size?: "sm" | "md";
  className?: string;
}

export default function Badge({
  children,
  variant = "primary",
  size = "md",
  className = "",
}: BadgeProps) {
  const baseStyles = "inline-flex items-center font-sans font-semibold rounded-full tracking-tight";

  const variants = {
    primary: "bg-primary text-white",
    secondary: "bg-secondary text-white",
    tertiary: "bg-tertiary text-white",
    outline: "border border-divider text-muted bg-surface",
    surface: "bg-surface/90 text-primary backdrop-blur-md border border-divider/50 shadow-xs",
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-[11px]",
    md: "px-3.5 py-1 text-xs",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
