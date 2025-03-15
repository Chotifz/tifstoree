import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "next-themes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" || 'https://tifstore.com';

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <ThemeProvider
        attribute="class"
        // defaultTheme="light"
        enableSystem
        >
          <Header />
          {children}
          <Footer />
      </ThemeProvider>
         
            
      </body>
    </html>
  );
}
