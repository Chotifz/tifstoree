"use client"

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

  const themeToggleIcon = mounted ? 
  (theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />) :
  null; 

  return (
    <footer className="bg-card text-card-foreground py-10 mt-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <div className="font-semibold text-lg mb-4 flex items-center w-full justify-between md:pr-4">
              <span className='w-full flex items-center'>
                <span className="tracking-wider font-bold text-primary">TIF</span> Store
              </span>
              
              <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 "
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={mounted ? (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode') : ''}
            >
              {themeToggleIcon}
            </Button>
             
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              Top up game favorit kamu dengan mudah, aman, dan harga terjangkau
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-3 text-primary">Kategori</h4>
              <ul className="text-muted-foreground text-sm space-y-2">
                <li className="hover:text-foreground transition-colors cursor-pointer">Mobile Games</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">PC Games</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Voucher</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Konsol Games</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-primary">Metode Pembayaran</h4>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="bg-white rounded p-1">
                  <img src="/images/method/dana.png" alt="DANA" className="h-6 object-contain" />
                </div>
                <div className="bg-white rounded p-1">
                  <img src="/images/method/ovo.png" alt="OVO" className="h-6 object-contain" />
                </div>
                <div className="bg-white rounded p-1">
                  <img src="/images/method/gopay.png" alt="GoPay" className="h-6 object-contain" />
                </div>
                <div className="bg-white rounded p-1">
                  <img src="/images/method/qbri2.png" alt="BRI" className="h-6 object-contain" />
                </div>
                <div className="bg-white rounded p-1">
                  <img src="/images/method/qqris.jpg" alt="QRIS" className="h-6 object-contain" />
                </div>
                <div className="bg-white rounded p-1">
                  <img src="/images/method/bca.png" alt="BCA" className="h-6 object-contain" />
                </div>
                <div className="bg-white rounded p-1">
                  <img src="/images/method/mandiri.png" alt="Mandiri" className="h-6 object-contain" />
                </div>
                <div className="bg-white rounded p-1">
                  <img src="/images/method/linkaja2.png" alt="LinkAja" className="h-6 object-contain" />
                </div>
                <div className="bg-white rounded p-1">
                  <img src="/images/method/shopeepay.png" alt="ShopeePay" className="h-6 object-contain" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-primary">Bantuan</h4>
              <ul className="text-muted-foreground text-sm space-y-2">
                <li className="hover:text-foreground transition-colors cursor-pointer">FAQ</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Syarat & Ketentuan</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Kontak</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Cara Pembayaran</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center text-muted-foreground text-sm">
          <div>© 2025 TIF Store. Semua hak dilindungi.</div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link href="#" className="hover:text-primary transition-colors">
              <FaFacebook size={18} />
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              <FaInstagram size={18} />
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              <FaTwitter size={18} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}