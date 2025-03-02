
import React from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <motion.main 
        className="flex-1 px-4 pt-6 pb-16 overflow-x-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default MainLayout;
