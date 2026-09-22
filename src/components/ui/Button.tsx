import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-sans font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/20";

  const variants = {
    primary: "bg-primary text-white hover:opacity-90 active:scale-[0.99]",
    secondary: "bg-secondary text-white hover:opacity-90 active:scale-[0.99]",
    outline:
      "border border-divider bg-surface text-primary hover:border-primary/40 hover:bg-background active:scale-[0.99]",
    ghost: "text-muted hover:text-primary hover:bg-black/5 active:scale-[0.99]",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs rounded-md gap-1.5",
    md: "px-5 py-2.5 text-sm rounded-lg gap-2",
    lg: "px-6 py-3 text-base rounded-xl gap-2.5",
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
