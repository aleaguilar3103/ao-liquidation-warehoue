import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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
  available: boolean;
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

  const { data, error } = await supabase
    .from('products')
    .insert([product])
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

  const { data, error } = await supabase
    .from('products')
    .update(product)
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

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    return false;
  }

  return true;
}