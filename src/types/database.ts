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
          price_per_sqm: number | null;
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
          price_per_sqm?: number | null;
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
          price_per_sqm?: number | null;
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
          {
            foreignKeyName: "properties_agent_id_fkey";
            columns: ["agent_id"];
            referencedRelation: "agents_public";
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
          first_contacted_at: string | null;
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
          first_contacted_at?: string | null;
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
          first_contacted_at?: string | null;
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
            foreignKeyName: "inquiries_agent_id_fkey";
            columns: ["agent_id"];
            referencedRelation: "agents_public";
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
      property_views: {
        Row: {
          id: string;
          property_id: string;
          viewer_id: string | null;
          session_id: string;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          viewer_id?: string | null;
          session_id: string;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          viewer_id?: string | null;
          session_id?: string;
          viewed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_views_property_id_fkey";
            columns: ["property_id"];
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_views_viewer_id_fkey";
            columns: ["viewer_id"];
            referencedRelation: "profiles";
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
      record_property_view: {
        Args: {
          p_property_id: string;
          p_session_id: string;
        };
        Returns: boolean;
      };
      get_agent_property_analytics: {
        Args: Record<PropertyKey, never>;
        Returns: {
          property_id: string;
          property_title: string;
          property_slug: string;
          property_price: number;
          property_status: string;
          property_city: string;
          property_cover_image: string;
          views_count: number;
          unique_viewers_count: number;
          favorites_count: number;
          inquiries_count: number;
          inquiry_conversion_rate: number;
          created_at: string;
        }[];
      };
      get_agent_response_velocity: {
        Args: Record<PropertyKey, never>;
        Returns: {
          total_inquiries: number;
          responded_inquiries: number;
          pending_inquiries: number;
          avg_response_hours: number;
          avg_response_seconds: number;
          fastest_response_hours: number;
        }[];
      };
    };
    Enums: Record<string, never>;
  };
}
