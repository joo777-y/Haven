import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionById } from "@/lib/collections/queries";
import CollectionDetailView from "@/components/collections/CollectionDetailView";

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CollectionDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const collection = await getCollectionById(id);

  if (!collection) {
    return {
      title: "Collection Not Found | HAVEN",
    };
  }

  return {
    title: `${collection.name} | Curated Collection | HAVEN`,
    description: `Private curated portfolio of ${collection.propertyCount} luxury residences in ${collection.name}.`,
  };
}

export default async function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { id } = await params;
  const collection = await getCollectionById(id);

  if (!collection) {
    notFound();
  }

  return <CollectionDetailView initialCollection={collection} />;
}
