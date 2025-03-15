"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { Bell, Search, Menu, X, ShoppingCart, User, LogOut, ChevronDown } from 'lucide-react';

// import { useCart } from '@/hooks/useCart';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useRouter } from 'next/navigation';



export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const router = useRouter();
  // const { user, isAuthenticated, logout } = useAuth();

  const isAuthenticated = true
  const user = ""
  const logout = ""
  

  // Check if window scrolled for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchBar(false);
    }
  };

  const navItems = [
    { name: 'Games', href: '#' },
    { name: 'Kategori', href: '#' },
    { name: 'Cara Topup', href: '#' },
    { name: 'Promo', href: '#' },
  ];

  // Utilities
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // const cartItemsCount = cartItems?.length || 0;

  return (
    <header 
      className={`sticky top-0 z-50 w-full bg-background border-b transition-all duration-200 ${
        isScrolled ? 'shadow-md border-border/40' : 'border-border/20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4 md:space-x-10">
          {/* Logo */}
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="flex items-center">
              <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21,6H3A2,2 0 0,0 1,8V16A2,2 0 0,0 3,18H21A2,2 0 0,0 23,16V8A2,2 0 0,0 21,6M21,16H3V8H21M6,15H8V13H10V11H8V9H6V11H4V13H6M14,15H19V13H14V11H19V9H14A2,2 0 0,0 12,11V13A2,2 0 0,0 14,15Z" />
                </svg>
              </div>
              <span className="ml-2 font-bold text-xl text-foreground">
                <span className="tracking-wide text-primary">TIF</span> Store
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-base font-medium transition-colors ${
                  router.pathname === item.href
                    ? 'text-primary'
                    : 'text-foreground/80 hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center justify-end md:flex-1 space-x-3">
            {/* Search Icon/Bar */}
            <div className="relative">
              {showSearchBar ? (
                <form onSubmit={handleSearch} className="absolute right-0 top-0 w-64 flex">
                  <Input
                    type="text"
                    placeholder="Cari game..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    variant="ghost"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSearchBar(true)}
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>


            {/* Notifications */}
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User Menu or Auth Buttons */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
                      <AvatarFallback>J</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.name || "jhondoe"}</span>
                      <span className="text-xs text-muted-foreground font-normal truncate">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer w-full">
                      <User className="mr-2 h-4 w-4" /> Akun Saya
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orderes" className="cursor-pointer w-full">
                      <ShoppingCart className="mr-2 h-4 w-4" /> Pesanan Saya
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-medium">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="font-medium">
                    Daftar
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-3">
            {/* Mobile Search Icon */}
            <Button variant="ghost" size="icon" onClick={() => setShowSearchBar(!showSearchBar)}>
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Mobile Cart Icon */}
            {/* <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <Badge 
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                  >
                    {cartItemsCount > 9 ? '9+' : cartItemsCount}
                  </Badge>
                )}
              </Button>
            </Link> */}
            
            {/* Mobile menu drawer */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-center">
                    <svg className="h-6 w-6 text-primary mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21,6H3A2,2 0 0,0 1,8V16A2,2 0 0,0 3,18H21A2,2 0 0,0 23,16V8A2,2 0 0,0 21,6M21,16H3V8H21M6,15H8V13H10V11H8V9H6V11H4V13H6M14,15H19V13H14V11H19V9H14A2,2 0 0,0 12,11V13A2,2 0 0,0 14,15Z" />
                    </svg>
                    <span className="font-bold text-xl">
                      <span className="text-primary">TIF</span> Store
                    </span>
                  </SheetTitle>
                </SheetHeader>
                
                {/* Mobile login/profile section */}
                {isAuthenticated ? (
                  <div className="flex items-center mb-6 p-4 bg-secondary/20 rounded-lg">
                    <Avatar className="h-10 w-10 mr-3">
                      {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
                      <AvatarFallback>
                        { getInitials(user.name)} 
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{user?.name || "Jhon Doe"}</p>
                      <p className="text-sm text-muted-foreground truncate">{user?.email || "jhondoe@gmail.com"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-2 mb-6">
                    <Link href="/login" className="flex-1">
                      <Button variant="outline" className="w-full">Masuk</Button>
                    </Link>
                    <Link href="/register" className="flex-1">
                      <Button className="w-full">Daftar</Button>
                    </Link>
                  </div>
                )}
                
                {/* Mobile search */}
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Cari game..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      variant="ghost"
                      className="absolute right-0 top-0"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
                
                {/* Mobile Navigation */}
                <nav className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.name}>
                      <Link
                        href={item.href}
                        className={`py-2 px-1 text-base font-medium transition-colors ${
                          router.pathname === item.href
                            ? 'text-primary border-l-2 border-primary pl-3 -ml-1'
                            : 'text-foreground/80 hover:text-primary'
                        }`}
                      >
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                
                {/* Additional Mobile Links */}
                <div className="mt-8 pt-6 border-t">
                  <nav className="flex flex-col space-y-4">
                    <Link href="/account" className="text-muted-foreground hover:text-foreground transition-colors">
                      Akun Saya
                    </Link>
                    <Link href="/orders" className="text-muted-foreground hover:text-foreground transition-colors">
                      Pesanan Saya
                    </Link>
                    <Link href="/how-to" className="text-muted-foreground hover:text-foreground transition-colors">
                      Cara Top Up
                    </Link>
                    {isAuthenticated && (
                      <Button 
                        variant="ghost" 
                        onClick={logout} 
                        className="justify-start px-0 text-destructive hover:text-destructive font-normal"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </Button>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        

        {/* Mobile Search Bar - Full Width when active */}
        {showSearchBar && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <Input
                type="text"
                placeholder="Cari games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <Button 
                type="submit" 
                size="icon" 
                variant="ghost"
                className="ml-2"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                size="icon" 
                variant="ghost"
                onClick={() => setShowSearchBar(false)}
                className="ml-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}