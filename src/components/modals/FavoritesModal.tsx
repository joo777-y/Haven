"use client";

import Link from "next/link";
import { X, Heart, Building2, ArrowRight } from "lucide-react";

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialFavorites = [
  {
    id: "1",
    title: "Modern Minimalist Villa",
    location: "Beverly Hills, CA",
    price: "$2,450,000",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80",
    beds: 4,
    baths: 3,
  },
  {
    id: "2",
    title: "Luxury Penthouse Suite",
    location: "Downtown, New York",
    price: "$4,100,000",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    beds: 3,
    baths: 3.5,
  },
];

export default function FavoritesModal({ isOpen, onClose }: FavoritesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-background shadow-2xl border-l border-divider animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-divider px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary">
              <Heart className="h-5 w-5 fill-secondary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">Saved Properties</h3>
              <p className="text-xs text-muted">Quick access to your bookmarked homes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-surface hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {initialFavorites.length > 0 ? (
            initialFavorites.map((item) => (
              <div
                key={item.id}
                className="group flex gap-4 rounded-xl border border-divider bg-surface p-3 transition-all hover:border-secondary/40 hover:shadow-md"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-20 w-24 rounded-lg object-cover"
                />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h4 className="font-display text-sm font-semibold text-foreground group-hover:text-secondary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted mt-0.5">{item.location}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-sans text-xs font-bold text-primary">{item.price}</span>
                    <span className="text-[11px] text-muted">
                      {item.beds} beds • {item.baths} baths
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-muted mb-4 border border-divider">
                <Building2 className="h-8 w-8" />
              </div>
              <h4 className="font-display text-base font-semibold text-foreground">No saved properties</h4>
              <p className="text-xs text-muted mt-1 max-w-[240px]">
                Click the heart icon on any property listing to save it for later.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-divider p-6 bg-surface">
          <Link
            href="/properties"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3 px-4 font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90 w-full"
          >
            <span>Explore All Properties</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
