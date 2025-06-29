'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import { 
  LogOut, 
  MessageSquare, 
  User,
  Menu,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Toaster } from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Define a more specific type for the auth context values we use here
interface AppAuthContext {
  logout: () => Promise<void>;
  // Add other properties from useAuth if needed by this component
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { logout } = useAuth() as AppAuthContext; // Cast to the defined type
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  
  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(err => {
            console.error('Service Worker registration failed:', err);
          });
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-card border-b border-border shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-semibold text-primary">AI Agent</span>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary rounded-md p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <NavItem href="/chat" icon={<MessageSquare size={20} />} text="Chat" />
            <NavItem href="/profile" icon={<User size={20} />} text="Profile" />
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-primary hover:bg-destructive/10 flex items-center space-x-2 px-3 py-2 rounded-md"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </Button>
          </nav>
        </div>
        
        {/* Mobile Navigation - Improved Styling */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-card border-t border-border shadow-lg">
            <nav className="flex flex-col space-y-1 p-2">
              <MobileNavItem 
                href="/chat" 
                icon={<MessageSquare size={22} />} 
                text="Chat" 
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <MobileNavItem 
                href="/profile" 
                icon={<User size={22} />} 
                text="Profile" 
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <Button
                variant="ghost"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-destructive/10 flex items-center space-x-2 px-3 py-3 text-base rounded-md"
              >
                <LogOut size={22} />
                <span>Logout</span>
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-card border-t border-border p-4 text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} AI Agent. All rights reserved. </p>
      </footer>

      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'bg-popover text-popover-foreground border border-border rounded-lg shadow-lg',
          duration: 5000,
          style: {
            background: 'hsl(var(--popover))',
            color: 'hsl(var(--popover-foreground))',
            border: `1px solid hsl(var(--border))`,
          },
          success: {
            iconTheme: {
              primary: 'hsl(var(--primary))',
              secondary: 'hsl(var(--background))',
            },
          },
          error: {
            iconTheme: {
              primary: 'hsl(var(--destructive))',
              secondary: 'hsl(var(--background))',
            },
          },
        }}
      />
    </div>
  );
};

// Helper components for navigation items - Adjusted Styling
const NavItem = ({ href, icon, text }: { href: string, icon: React.ReactNode, text: string }) => (
  <Link 
    href={href} 
    className="text-muted-foreground hover:text-primary hover:bg-accent focus-visible:bg-accent focus-visible:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
  >
    {icon}
    <span>{text}</span>
  </Link>
);

const MobileNavItem = ({ href, icon, text, onClick }: { href: string, icon: React.ReactNode, text: string, onClick: () => void }) => (
  <Link 
    href={href} 
    className="text-muted-foreground hover:text-primary hover:bg-accent focus-visible:bg-accent focus-visible:text-accent-foreground focus:outline-none flex items-center space-x-3 rounded-md px-3 py-3 text-base font-medium transition-colors"
    onClick={onClick}
  >
    {icon}
    <span>{text}</span>
  </Link>
);

