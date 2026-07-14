import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/client";
import type { ProductStatus } from "@/lib/product-status";

export interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  quantity: number;
  units_per_pallet: number;
  image_url: string;
  additional_images?: string[];
  featured: boolean;
  status?: ProductStatus;
  is_visible?: boolean;
  /** @deprecated Migrado a `status`. Se retira en la limpieza final. */
  available?: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty products');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getPublicProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty public products');
    return [];
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_visible', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public products:', error);
    return [];
  }

  return data || [];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty featured products');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching featured products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.warn('Error fetching featured products:', error);
    return [];
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty products');
    return [];
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }

  return data || [];
}

export async function addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase not configured, cannot add product');
    return null;
  }

  const db = createClient();
  // Cast puntual: @supabase/ssr@0.5.2 (instalado) infiere el genérico Database
  // de forma incompatible con @supabase/supabase-js@2.76 (mismatch de versiones
  // preexistente, no introducido por este cambio), lo que resuelve el tipo de
  // fila a `never`. No afecta el comportamiento en runtime.
  const { data, error } = await db
    .from('products')
    .insert([product] as never)
    .select()
    .single();

  if (error) {
    console.error('Error adding product:', error);
    return null;
  }

  return data;
}

export async function updateProduct(id: string, product: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase not configured, cannot update product');
    return null;
  }

  const db = createClient();
  // Ver nota de cast en addProduct (mismatch de tipos @supabase/ssr vs supabase-js).
  const { data, error } = await db
    .from('products')
    .update(product as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    return null;
  }

  return data;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase not configured, cannot delete product');
    return false;
  }

  const db = createClient();
  const { error } = await db
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    return false;
  }

  return true;
}