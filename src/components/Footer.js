'use client';

import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Footer() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  
  const ThemeIcon = mounted ? (theme === 'dark' ? Sun : Moon) : null;
  
  return (
    <footer className="bg-card text-card-foreground py-10 mt-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row justify-between">
          {/* Brand section */}
          <div className="mb-6 md:mb-0">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-lg">
                <span className="tracking-wider font-bold text-primary">TIF</span> Store
              </div>
              
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 md:ml-2"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <ThemeIcon className="h-5 w-5" />
                </Button>
              )}
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              Top up game favorit kamu dengan mudah, aman, dan harga terjangkau
            </p>
          </div>
          
          {/* Links section */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Categories */}
            <div>
              <h4 className="font-semibold mb-3 text-primary">Kategori</h4>
              <ul className="text-muted-foreground text-sm space-y-2">
                {['Mobile Games', 'PC Games', 'Voucher', 'Konsol Games'].map((item) => (
                  <li key={item} className="hover:text-foreground transition-colors cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Help section */}
            <div>
              <h4 className="font-semibold mb-3 text-primary">Bantuan</h4>
              <ul className="text-muted-foreground text-sm space-y-2">
                {['Syarat & Ketentuan', 'Hubungi Kami'].map((item) => (
                  <li key={item} className="hover:text-foreground transition-colors cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Footer bottom */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center text-muted-foreground text-sm">
          <div>© 2025 TIF Store. Semua hak dilindungi.</div>
          
          {/* Social media links */}
          <div className="mt-4 md:mt-0 flex space-x-4">
            {[
              { Icon: FaFacebook, href: '#' },
              { Icon: FaInstagram, href: '#' },
              { Icon: FaTwitter, href: '#' }
            ].map(({ Icon, href }, index) => (
              <Link key={index} href={href} className="hover:text-primary transition-colors">
                <Icon size={18} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}