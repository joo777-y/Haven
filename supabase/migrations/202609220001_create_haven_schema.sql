-- ==============================================================================
-- HAVEN Real Estate Platform — Database Schema Migration
-- Migration: 202609220001_create_haven_schema.sql
-- Description: Creates the approved core schema tables for the HAVEN platform:
--              agents, properties, property_images, property_features,
--              favorites, collections, collection_properties, and inquiries.
--
-- Foreign Key Deletion Strategy:
--   - agents -> properties: ON DELETE RESTRICT (prevents accidental cascade destruction of properties)
--   - agents -> inquiries: ON DELETE RESTRICT (preserves inquiry history)
--   - profiles -> agents: ON DELETE RESTRICT (prevents deleting active agent profiles without cleanup)
--   - property -> property_images / property_features / favorites / collection_properties: ON DELETE CASCADE
--   - collection -> collection_properties: ON DELETE CASCADE
--   - profiles -> favorites / collections / inquiries: ON DELETE CASCADE
-- ==============================================================================

-- 1. Helper Function: Reusable updated_at Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Table: agents
CREATE TABLE public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    company_name TEXT,
    professional_title TEXT,
    bio TEXT,
    phone TEXT,
    email TEXT,
    license_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_agents_profile_id UNIQUE (profile_id)
);

CREATE TRIGGER set_agents_updated_at
BEFORE UPDATE ON public.agents
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 3. Table: properties
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'rent')),
    property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'villa', 'studio', 'chalet', 'townhouse', 'penthouse')),
    bedrooms INTEGER CHECK (bedrooms >= 0),
    bathrooms INTEGER CHECK (bathrooms >= 0),
    area NUMERIC CHECK (area >= 0),
    parking_spaces INTEGER CHECK (parking_spaces >= 0),
    year_built INTEGER,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    neighborhood TEXT,
    address TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_properties_slug UNIQUE (slug)
);

CREATE TRIGGER set_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 4. Table: property_images
CREATE TABLE public.property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_cover BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Table: property_features
CREATE TABLE public.property_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Table: favorites
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_favorites_user_property UNIQUE (user_id, property_id)
);

-- 7. Table: collections
CREATE TABLE public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_collections_updated_at
BEFORE UPDATE ON public.collections
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 8. Table: collection_properties
CREATE TABLE public.collection_properties (
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (collection_id, property_id)
);

-- 9. Table: inquiries
CREATE TABLE public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE RESTRICT,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_inquiries_updated_at
BEFORE UPDATE ON public.inquiries
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- INDEXES
-- Non-redundant indexes supporting relationships, foreign keys, and filter queries
-- ==============================================================================

-- Properties
CREATE INDEX idx_properties_agent_id ON public.properties(agent_id);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX idx_properties_property_type ON public.properties(property_type);
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_price ON public.properties(price);

-- Property Media & Features
CREATE INDEX idx_property_images_property_sort ON public.property_images(property_id, sort_order);
CREATE INDEX idx_property_features_property_id ON public.property_features(property_id);

-- Favorites
CREATE INDEX idx_favorites_property_id ON public.favorites(property_id);

-- Collections
CREATE INDEX idx_collections_user_id ON public.collections(user_id);
CREATE INDEX idx_collection_properties_property_id ON public.collection_properties(property_id);

-- Inquiries
CREATE INDEX idx_inquiries_user_id ON public.inquiries(user_id);
CREATE INDEX idx_inquiries_agent_id ON public.inquiries(agent_id);
CREATE INDEX idx_inquiries_property_id ON public.inquiries(property_id);
CREATE INDEX idx_inquiries_status ON public.inquiries(status);
