/**
 * Generated-type compatible contract for the Phase 2 Supabase schema.
 * Regenerate against a running local project with:
 * `pnpm exec supabase gen types typescript --local > apps/web/src/lib/supabase/database.types.ts`
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'customer' | 'admin';
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'admin';
          created_at?: string;
          updated_at?: string;
        },
        {
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'admin';
          updated_at?: string;
        }
      >;
      categories: Table<
        {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        {
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          updated_at?: string;
        }
      >;
      products: Table<
        {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          price: number;
          compare_at_price: number | null;
          image_url: string | null;
          model_3d_url: string | null;
          stock: number;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          category_id?: string | null;
          name: string;
          slug: string;
          short_description?: string | null;
          description?: string | null;
          price: number;
          compare_at_price?: number | null;
          image_url?: string | null;
          model_3d_url?: string | null;
          stock?: number;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        {
          category_id?: string | null;
          name?: string;
          slug?: string;
          short_description?: string | null;
          description?: string | null;
          price?: number;
          compare_at_price?: number | null;
          image_url?: string | null;
          model_3d_url?: string | null;
          stock?: number;
          is_featured?: boolean;
          is_active?: boolean;
          updated_at?: string;
        }
      >;
      product_images: Table<
        {
          id: string;
          product_id: string;
          image_url: string;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        },
        {
          id?: string;
          product_id: string;
          image_url: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        },
        { image_url?: string; alt_text?: string | null; sort_order?: number }
      >;
      product_variants: Table<
        {
          id: string;
          product_id: string;
          color_name: string;
          color_hex: string | null;
          size: string;
          stock: number;
          sku: string;
          created_at: string;
        },
        {
          id?: string;
          product_id: string;
          color_name: string;
          color_hex?: string | null;
          size: string;
          stock?: number;
          sku: string;
          created_at?: string;
        },
        {
          color_name?: string;
          color_hex?: string | null;
          size?: string;
          stock?: number;
          sku?: string;
        }
      >;
      favorites: Table<
        { id: string; user_id: string; product_id: string; created_at: string },
        { id?: string; user_id: string; product_id: string; created_at?: string },
        Record<never, never>
      >;
      cart_items: Table<
        {
          id: string;
          user_id: string;
          product_id: string;
          product_variant_id: string | null;
          quantity: number;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          product_id: string;
          product_variant_id?: string | null;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        },
        {
          product_id?: string;
          product_variant_id?: string | null;
          quantity?: number;
          updated_at?: string;
        }
      >;
      orders: Table<
        {
          id: string;
          user_id: string;
          order_number: string;
          subtotal: number;
          shipping_cost: number;
          total: number;
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          customer_name: string;
          customer_email: string;
          shipping_address: Json;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          order_number: string;
          subtotal: number;
          shipping_cost?: number;
          total: number;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          customer_name: string;
          customer_email: string;
          shipping_address: Json;
          created_at?: string;
          updated_at?: string;
        },
        {
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          updated_at?: string;
        }
      >;
      order_items: Table<
        {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          product_image_url: string | null;
          selected_size: string | null;
          selected_color: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        },
        {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          product_image_url?: string | null;
          selected_size?: string | null;
          selected_color?: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        },
        Record<never, never>
      >;
    };
    Views: Record<never, never>;
    Functions: {
      create_order_from_cart: {
        Args: {
          p_customer_name: string;
          p_customer_email: string;
          p_shipping_address: Json;
          p_shipping_cost?: number;
        };
        Returns: string;
      };
      is_admin: { Args: Record<never, never>; Returns: boolean };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
