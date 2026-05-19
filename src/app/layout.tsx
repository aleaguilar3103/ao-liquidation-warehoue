import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// -----------------------------------------------------
// CONFIGURACIÓN GLOBAL DE METADATA (SEO)
// El título de Open Graph (para compartir) fue igualado al Título de Google.
// -----------------------------------------------------

// El título que quieres ver en GOOGLE y al COMPARTIR
const MAIN_SEO_TITLE =
  "Su Proveedor Oficial de Mercancía de Liquidación Premium en Costa Rica";
const MAIN_OG_DESCRIPTION =
  "Establezca una relación sólida con su fuente directa de pallets y contenedores de grandes minoristas de EE. UU. ¡Transparencia, Variedad y Precios Justos!";
const MAIN_URL = "https://www.aoliquidationwarehouse.com/";
const OG_IMAGE_URL =
  "https://storage.googleapis.com/msgsndr/pvSYCYQR9RHbeg9BXuIL/media/6902623210e460f861271016.png";

export const metadata: Metadata = {
  // 1. METADATOS BÁSICOS (PARA GOOGLE)
  title: {
    default: MAIN_SEO_TITLE,
    template: "%s | AO Liquidation Warehouse",
  },

  // Descripción optimizada usando el texto de Misión, Visión y Principios.
  description:
    "Accede a productos de liquidación de calidad y precios inmejorables. Brindamos programas flexibles, transparencia y acompañamiento. Con más de 15 años de experiencia, ofrecemos lotes, pallets y contenedores 100% vírgenes.",

  // 2. METADATOS DE REDES SOCIALES (OPEN GRAPH)
  openGraph: {
    title: MAIN_SEO_TITLE, // *** ESTA LÍNEA FUE AJUSTADA AL TÍTULO PRINCIPAL ***
    description: MAIN_OG_DESCRIPTION,
    url: MAIN_URL,
    siteName: "AO Liquidation Warehouse",
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Lotes de Liquidación de Electrodomésticos y Construcción",
      },
    ],
    locale: "es_ES",
    type: "website",
  },

  // 3. METADATOS ADICIONALES
  keywords: [
    "liquidación Costa Rica",
    "pallets de liquidación",
    "contenedores de liquidación",
    "lotes para reventa",
    "mercadotería saldos",
    "electrodomésticos liquidación",
  ],
  authors: [{ name: "AO Liquidation Warehouse" }],
  metadataBase: new URL(MAIN_URL),

  // 4. TWITTER CARDS (PARA TWITTER/X)
  twitter: {
    card: "summary_large_image",
    title: MAIN_SEO_TITLE,
    description:
      "Encuentra las mejores ofertas en lotes de liquidación para tu negocio.",
    images: [OG_IMAGE_URL],
  },
};

// -----------------------------------------------------
// CÓDIGO DE COMPONENTE DE LAYOUT ORIGINAL
// -----------------------------------------------------

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
