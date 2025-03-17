'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  GamepadIcon, 
  ShoppingCart, 
  Tag, 
  Settings, 
  Bell, 
  Menu as MenuIcon, 
  X,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession, signOut } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SidebarItem = ({ icon, label, href, active }) => {
  return (
    <Link 
      href={href} 
      className={`flex items-center p-3 rounded-md transition-colors ${
        active 
          ? 'bg-primary/10 text-primary font-medium' 
          : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </Link>
  );
};

export default function AdminDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const sidebarItems = [
    { 
      icon: <LayoutDashboard size={20} />, 
      label: 'Dashboard', 
      href: '/admin' 
    },
    { 
      icon: <Users size={20} />, 
      label: 'Users', 
      href: '/admin/users' 
    },
    { 
      icon: <GamepadIcon size={20} />, 
      label: 'Games', 
      href: '/admin/games' 
    },
    { 
      icon: <ShoppingCart size={20} />, 
      label: 'Orders', 
      href: '/admin/orders' 
    },
    { 
      icon: <Tag size={20} />, 
      label: 'Products', 
      href: '/admin/products' 
    },
    { 
      icon: <Settings size={20} />, 
      label: 'Settings', 
      href: '/admin/settings' 
    },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link href="/admin" className="flex items-center">
            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary mr-2">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21,6H3A2,2 0 0,0 1,8V16A2,2 0 0,0 3,18H21A2,2 0 0,0 23,16V8A2,2 0 0,0 21,6M21,16H3V8H21M6,15H8V13H10V11H8V9H6V11H4V13H6M14,15H19V13H14V11H19V9H14A2,2 0 0,0 12,11V13A2,2 0 0,0 14,15Z" />
              </svg>
            </div>
            <span className="font-bold text-lg">
              <span className="text-primary">TIF</span> Admin
            </span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>
        
        <div className="p-4 space-y-1">
          {sidebarItems.map((item) => (
            <SidebarItem 
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={pathname === item.href}
            />
          ))}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Separator className="mb-4" />
          <p className="text-xs text-center text-muted-foreground mb-2">
            © 2025 TIF Store Admin
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="flex items-center h-16 px-4 border-b bg-card">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon size={20} />
          </Button>
          
          <div className="flex-1" />
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image} alt={session?.user?.name || 'Admin'} />
                    <AvatarFallback>
                      {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'A'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{session?.user?.name || 'Admin'}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {session?.user?.email || 'admin@example.com'}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/sign-in' })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}