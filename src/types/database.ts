export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          phone: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      agents: {
        Row: {
          id: string;
          profile_id: string;
          company_name: string | null;
          professional_title: string | null;
          bio: string | null;
          phone: string | null;
          email: string | null;
          license_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          company_name?: string | null;
          professional_title?: string | null;
          bio?: string | null;
          phone?: string | null;
          email?: string | null;
          license_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          company_name?: string | null;
          professional_title?: string | null;
          bio?: string | null;
          phone?: string | null;
          email?: string | null;
          license_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agents_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      properties: {
        Row: {
          id: string;
          agent_id: string;
          title: string;
          slug: string;
          description: string;
          price: number;
          listing_type: "sale" | "rent";
          property_type:
            | "apartment"
            | "villa"
            | "studio"
            | "chalet"
            | "townhouse"
            | "penthouse";
          bedrooms: number | null;
          bathrooms: number | null;
          area: number | null;
          parking_spaces: number | null;
          year_built: number | null;
          country: string;
          city: string;
          neighborhood: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          status: "draft" | "published" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          title: string;
          slug: string;
          description: string;
          price: number;
          listing_type: "sale" | "rent";
          property_type:
            | "apartment"
            | "villa"
            | "studio"
            | "chalet"
            | "townhouse"
            | "penthouse";
          bedrooms?: number | null;
          bathrooms?: number | null;
          area?: number | null;
          parking_spaces?: number | null;
          year_built?: number | null;
          country: string;
          city: string;
          neighborhood?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          status?: "draft" | "published" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          title?: string;
          slug?: string;
          description?: string;
          price?: number;
          listing_type?: "sale" | "rent";
          property_type?:
            | "apartment"
            | "villa"
            | "studio"
            | "chalet"
            | "townhouse"
            | "penthouse";
          bedrooms?: number | null;
          bathrooms?: number | null;
          area?: number | null;
          parking_spaces?: number | null;
          year_built?: number | null;
          country?: string;
          city?: string;
          neighborhood?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          status?: "draft" | "published" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "properties_agent_id_fkey";
            columns: ["agent_id"];
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          image_url: string;
          sort_order: number;
          is_cover: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          image_url: string;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          image_url?: string;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey";
            columns: ["property_id"];
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      property_features: {
        Row: {
          id: string;
          property_id: string;
          feature: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          feature: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          feature?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_features_property_id_fkey";
            columns: ["property_id"];
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          property_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_property_id_fkey";
            columns: ["property_id"];
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      collections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collections_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      collection_properties: {
        Row: {
          collection_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          collection_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: {
          collection_id?: string;
          property_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collection_properties_collection_id_fkey";
            columns: ["collection_id"];
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collection_properties_property_id_fkey";
            columns: ["property_id"];
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      inquiries: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string;
          property_id: string;
          message: string;
          status: "new" | "contacted" | "closed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id: string;
          property_id: string;
          message: string;
          status?: "new" | "contacted" | "closed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          agent_id?: string;
          property_id?: string;
          message?: string;
          status?: "new" | "contacted" | "closed";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inquiries_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inquiries_agent_id_fkey";
            columns: ["agent_id"];
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inquiries_property_id_fkey";
            columns: ["property_id"];
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      agents_public: {
        Row: {
          id: string;
          profile_id: string;
          full_name: string;
          avatar_url: string | null;
          company_name: string | null;
          professional_title: string | null;
          bio: string | null;
          created_at: string;
        };
        Relationships: [
          {
            foreignKeyName: "agents_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      update_inquiry_status: {
        Args: {
          p_inquiry_id: string;
          p_status: "contacted" | "closed";
        };
        Returns: Database["public"]["Tables"]["inquiries"]["Row"];
      };
    };
    Enums: Record<string, never>;
  };
}
