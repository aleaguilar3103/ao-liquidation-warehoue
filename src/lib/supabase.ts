import { createClient } from '@supabase/supabase-js';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client with empty strings if env vars are missing (for build time)
// Runtime checks will handle missing credentials
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Helper to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseAnonKey !== 'placeholder-key');
}

/**
 * Comprime una imagen en el navegador antes de subirla: la redimensiona a un
 * lado máximo (default 1600px) y la reencodea como JPEG. Así una foto de 4-6 MB
 * salida directa del celular queda en ~150-300 KB sin depender de limpiezas
 * manuales del bucket. Si algo falla, o si comprimir no reduce el peso, devuelve
 * el archivo original intacto.
 */
export async function compressImage(
  file: File,
  { maxDimension = 1600, quality = 0.8 }: { maxDimension?: number; quality?: number } = {},
): Promise<File> {
  // Solo tocamos imágenes rasterizadas. SVG u otros formatos se dejan igual.
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('No se pudo decodificar la imagen'));
      image.src = dataUrl;
    });

    let { width, height } = img;
    if (width > maxDimension || height > maxDimension) {
      if (width >= height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    // Fondo blanco por si la fuente es un PNG con transparencia (JPEG no la soporta).
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    );

    // Si no se pudo generar el blob o quedó más pesado, nos quedamos con el original.
    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    });
  } catch (err) {
    console.warn('No se pudo comprimir la imagen, se sube el original:', err);
    return file;
  }
}

export async function uploadProductImage(file: File): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase is not configured');
    return null;
  }

  const compressed = await compressImage(file);

  const fileExt = compressed.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const db = createBrowserSupabaseClient();
  const { error } = await db.storage
    .from('product-images')
    // Nombres aleatorios = imágenes efectivamente inmutables, así que cacheamos
    // agresivamente (1 año) para no re-descargarlas en cada visita.
    .upload(filePath, compressed, {
      cacheControl: '31536000',
      contentType: compressed.type,
    });

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  const { data } = db.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteProductImage(imageUrl: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase is not configured');
    return false;
  }

  const fileName = imageUrl.split('/').pop();
  if (!fileName) return false;

  const db = createBrowserSupabaseClient();
  const { error } = await db.storage
    .from('product-images')
    .remove([fileName]);

  if (error) {
    console.error('Error deleting image:', error);
    return false;
  }

  return true;
}