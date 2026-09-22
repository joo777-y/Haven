import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface LifestyleCategory {
  id: string;
  title: string;
  slug: string;
  image: string;
  listingCount?: number;
  description?: string;
}

export interface LifestyleCardProps {
  category: LifestyleCategory;
  className?: string;
}

export default function LifestyleCard({
  category,
  className = "",
}: LifestyleCardProps) {
  return (
    <Link
      href={`/properties?category=${category.slug}`}
      className={`group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-divider bg-background shadow-xs transition-all duration-300 hover:shadow-card ${className}`}
    >
      {/* Background Image */}
      <img
        src={category.image}
        alt={category.title}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />

      {/* Dark Vignette Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity group-hover:opacity-90" />

      {/* Top Action Badge */}
      <div className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface/80 text-primary backdrop-blur-md transition-all group-hover:bg-primary group-hover:text-white">
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>

      {/* Bottom Content */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-6 flex flex-col justify-end">
        {category.listingCount !== undefined && (
          <span className="font-sans text-xs font-semibold text-secondary uppercase tracking-widest mb-1.5 block">
            {category.listingCount} Curated Homes
          </span>
        )}
        <h3 className="font-display text-2xl font-bold text-white tracking-tight group-hover:text-secondary transition-colors">
          {category.title}
        </h3>
        {category.description && (
          <p className="font-sans text-xs text-white/80 line-clamp-2 mt-2 leading-relaxed">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
}
