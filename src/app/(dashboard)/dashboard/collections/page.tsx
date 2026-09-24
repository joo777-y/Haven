import type { Metadata } from "next";
import { getUserCollections } from "@/lib/collections/queries";
import CollectionsManager from "@/components/collections/CollectionsManager";

export const metadata: Metadata = {
  title: "Curated Collections | HAVEN Workspace",
  description: "Organize luxury properties into tailored personal portfolios and project boards.",
};

export default async function CollectionsPage() {
  const collections = await getUserCollections();

  return (
    <div className="max-w-6xl mx-auto">
      <CollectionsManager initialCollections={collections} />
    </div>
  );
}
