"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderPlus, FolderHeart, Plus, ArrowLeft, Building2 } from "lucide-react";
import Button from "@/components/ui/Button";
import type { CollectionPreviewItem } from "@/types/collection";
import CollectionCard from "./CollectionCard";
import CreateCollectionDialog from "./CreateCollectionDialog";
import RenameCollectionDialog from "./RenameCollectionDialog";

interface CollectionsManagerProps {
  initialCollections: CollectionPreviewItem[];
}

export default function CollectionsManager({
  initialCollections,
}: CollectionsManagerProps) {
  const [collections, setCollections] =
    useState<CollectionPreviewItem[]>(initialCollections);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<CollectionPreviewItem | null>(
    null
  );

  const handleCreateSuccess = (newCol: { id: string; name: string }) => {
    const newItem: CollectionPreviewItem = {
      id: newCol.id,
      name: newCol.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      propertyCount: 0,
      previewImages: [],
      totalValue: 0,
    };
    setCollections((prev) => [newItem, ...prev]);
  };

  const handleRenameSuccess = (updated: { id: string; name: string }) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, name: updated.name } : c))
    );
  };

  const handleDeleteSuccess = (deletedId: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== deletedId));
  };

  const totalProperties = collections.reduce(
    (sum, c) => sum + c.propertyCount,
    0
  );

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="space-y-4 pb-6 border-b border-divider">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Dashboard Overview</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Curated Collections
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              Organize residences into bespoke thematic portfolios, project boards, and investment plans.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 text-xs self-start sm:self-auto cursor-pointer"
          >
            <FolderPlus className="h-4 w-4" />
            <span>New Collection</span>
          </Button>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center gap-3 pt-2 flex-wrap text-xs">
          <div className="rounded-lg border border-divider bg-surface px-3 py-1.5 flex items-center gap-2">
            <span className="text-muted">Total Collections:</span>
            <span className="font-semibold text-foreground">{collections.length}</span>
          </div>
          <div className="rounded-lg border border-divider bg-surface px-3 py-1.5 flex items-center gap-2">
            <span className="text-muted">Curated Residences:</span>
            <span className="font-semibold text-foreground">{totalProperties}</span>
          </div>
        </div>
      </div>

      {/* Grid or Empty State */}
      {collections.length === 0 ? (
        <div className="rounded-2xl border border-divider bg-surface p-12 text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-background border border-divider text-muted shadow-xs">
            <FolderHeart className="h-7 w-7 text-secondary" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-display text-xl font-semibold text-foreground">
              No Collections Created Yet
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Create thematic boards (e.g. &quot;Red Sea Villas&quot; or &quot;Urban Penthouses&quot;) to curate and track luxury properties for your next project.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setIsCreateOpen(true)}
              className="gap-2 text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Collection</span>
            </Button>
            <Link href="/properties">
              <Button variant="outline" size="md" className="gap-2 text-xs">
                <Building2 className="h-4 w-4" />
                <span>Explore Catalog</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <CollectionCard
              key={col.id}
              collection={col}
              onRename={(c) => setRenameTarget(c)}
              onDeleteSuccess={handleDeleteSuccess}
            />
          ))}

          {/* Quick Create Card Tile */}
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex flex-col items-center justify-center aspect-[16/10] sm:aspect-auto min-h-[220px] rounded-2xl border-2 border-dashed border-divider hover:border-primary/50 bg-background/50 hover:bg-surface/60 transition-all text-center p-6 cursor-pointer group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-divider text-muted group-hover:text-primary group-hover:scale-105 transition-all mb-3 shadow-2xs">
              <Plus className="h-6 w-6" />
            </div>
            <span className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
              Create Collection
            </span>
            <span className="text-xs text-muted mt-1">
              Add a new curated folder
            </span>
          </button>
        </div>
      )}

      {/* Dialogs */}
      <CreateCollectionDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <RenameCollectionDialog
        isOpen={Boolean(renameTarget)}
        onClose={() => setRenameTarget(null)}
        collection={renameTarget}
        onSuccess={handleRenameSuccess}
      />
    </div>
  );
}
