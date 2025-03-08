'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import { 
  LogOut, 
  MessageSquare, 
  LayoutDashboard,
  User,
  Menu,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Toaster } from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-blue-500">AI Agent</span>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} text="Dashboard" />
            <NavItem href="/chat" icon={<MessageSquare size={20} />} text="Chat" />
            <NavItem href="/profile" icon={<User size={20} />} text="Profile" />
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-gray-400 hover:text-white hover:bg-red-900/20 flex items-center space-x-2 px-3 py-2"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </Button>
          </nav>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700 p-4">
            <nav className="flex flex-col space-y-2">
              <MobileNavItem 
                href="/dashboard" 
                icon={<LayoutDashboard size={20} />} 
                text="Dashboard" 
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <MobileNavItem 
                href="/chat" 
                icon={<MessageSquare size={20} />} 
                text="Chat" 
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <MobileNavItem 
                href="/profile" 
                icon={<User size={20} />} 
                text="Profile" 
                onClick={() => setIsMobileMenuOpen(false)}
                />
              <Button
                variant="ghost"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-red-900/20 flex items-center space-x-2"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 p-4 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} AI Agent. All rights reserved.</p>
      </footer>

      <Toaster 
        position="top-right"
        toastOptions={{
          // Default options for all toasts
          className: '',
          duration: 5000,
          style: {
            background: '#1A1A1A',
            color: '#fff',
          },
          // Custom success color
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#1A1A1A',
            },
          },
          // Custom error color
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#1A1A1A',
            },
          },
        }}
      />


    </div>
  );
};

// Helper components for navigation items
const NavItem = ({ href, icon, text }: { href: string, icon: React.ReactNode, text: string }) => (
  <Link href={href} className="text-gray-400 hover:text-white hover:bg-gray-700 flex items-center space-x-2 rounded-md px-3 py-2">
    {icon}
    <span>{text}</span>
  </Link>
);

const MobileNavItem = ({ href, icon, text, onClick }: { href: string, icon: React.ReactNode, text: string, onClick: () => void }) => (
  <Link 
    href={href} 
    className="text-gray-400 hover:text-white hover:bg-gray-700 flex items-center space-x-2 rounded-md px-3 py-2"
    onClick={onClick}
  >
    {icon}
    <span>{text}</span>
  </Link>
);

