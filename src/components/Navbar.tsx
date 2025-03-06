
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import NavbarUserSection from './NavbarUserSection';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const isAuthPage = location.pathname === '/auth';

  if (isAuthPage) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
      <div className="flex h-16 items-center px-4">
        <Link to="/" className="font-bold text-xl mr-6 flex items-center">
          <img 
            src="/lovable-uploads/3c56ceb5-0b27-4455-aea0-40b4b1b31955.png" 
            alt="Bettr Logo" 
            className="h-8 w-auto mr-2"
          />
          Bettr
        </Link>
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className={cn("text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors", location.pathname === '/' && "text-gray-900 dark:text-white font-semibold")}>
            Habits
          </Link>
          {user?.id && (
            <Link to="/profile" className={cn("text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors", location.pathname === '/profile' && "text-gray-900 dark:text-white font-semibold")}>
              Profile
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 pt-6 w-64">
                <nav className="flex flex-col space-y-4">
                  <Link to="/" className={cn("block px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors", location.pathname === '/' && "text-gray-900 dark:text-white font-semibold")}>
                    Habits
                  </Link>
                  {user?.id && (
                    <Link to="/profile" className={cn("block px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors", location.pathname === '/profile' && "text-gray-900 dark:text-white font-semibold")}>
                      Profile
                    </Link>
                  )}
                  <div className="border-t mt-4 pt-4 px-4">
                    <NavbarUserSection />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          ) : (
            <NavbarUserSection />
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
