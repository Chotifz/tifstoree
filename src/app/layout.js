import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider"; // We'll create this
import ThemeProviderWrapper from "@/components/ThemeProviderWrapper";
import QueryProvider from "@/components/QueryProvider";
import { Toaster } from "sonner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL 
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: 'TIF Store | Top Up Game Favorite',
    template: '%s | TIF Store',
  },
  description: 'Top up Game dengan harga terbaik. Aman, Mudah dan Terpercaya.',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: 'TIF Store',
    title: 'TIF Store | Top Up Aman Dan Mudah',
    description: 'Top up Game dengan harga terbaik.',
    images: [
      {
        url: '/images/tif-store-og.png',
        width: 1200,
        height: 630,
        alt: 'TIF Store',
      },
    ],
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ThemeProviderWrapper>
            <QueryProvider>
              {children}
              <Toaster position="top-center" richColors />
            </QueryProvider>
          </ThemeProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}