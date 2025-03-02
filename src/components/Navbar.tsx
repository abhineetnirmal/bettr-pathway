
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, User, BarChart3, Menu, X } from 'lucide-react';
import Avatar from './Avatar';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { name: 'Home', icon: Home, to: '/' },
    { name: 'Calendar', icon: Calendar, to: '/calendar' },
    { name: 'Progress', icon: BarChart3, to: '/progress' },
    { name: 'Profile', icon: User, to: '/profile' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full">
      <nav className="glass-panel px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <motion.div 
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-bettr-blue to-bettr-purple flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-white font-bold text-lg">B</span>
          </motion.div>
          <span className="font-display text-xl font-semibold text-bettr-text-primary">Bettr</span>
        </Link>
        
        <div className="flex items-center space-x-3">
          <Avatar size="sm" />
          <motion.button
            className="md:hidden p-2 rounded-full hover:bg-black/5"
            whileTap={{ scale: 0.9 }}
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <Link 
              key={item.name}
              to={item.to}
              className="flex items-center space-x-1 text-bettr-text-secondary hover:text-bettr-blue transition-colors"
            >
              <item.icon size={16} />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="absolute top-full left-0 w-full glass-panel md:hidden py-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col">
              {navItems.map((item) => (
                <Link 
                  key={item.name}
                  to={item.to}
                  className="flex items-center space-x-2 px-6 py-3 text-bettr-text-secondary hover:text-bettr-blue hover:bg-black/5 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
