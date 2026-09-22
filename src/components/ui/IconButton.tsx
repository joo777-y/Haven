import React from "react";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  "aria-label": string;
}

export default function IconButton({
  children,
  variant = "ghost",
  size = "md",
  className = "",
  disabled,
  ...props
}: IconButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/20";

  const variants = {
    primary: "bg-primary text-white hover:opacity-90 active:scale-95",
    secondary: "bg-secondary text-white hover:opacity-90 active:scale-95",
    outline: "border border-divider bg-surface text-primary hover:border-primary/40 active:scale-95",
    ghost: "text-muted hover:text-primary hover:bg-black/5 active:scale-95",
  };

  const sizes = {
    sm: "p-1.5 h-8 w-8 text-xs",
    md: "p-2 h-10 w-10 text-sm",
    lg: "p-3 h-12 w-12 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
