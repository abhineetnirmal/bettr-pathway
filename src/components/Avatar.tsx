
import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const Avatar: React.FC<AvatarProps> = ({ 
  src = 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
  alt = 'User Avatar', 
  size = 'md',
  status
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  const statusClasses = {
    online: 'bg-bettr-green',
    offline: 'bg-gray-300',
    away: 'bg-yellow-400',
    busy: 'bg-red-500'
  };

  return (
    <div className="relative">
      <div 
        className={cn(
          'rounded-full overflow-hidden border-2 border-white shadow-sm',
          sizeClasses[size]
        )}
      >
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      {status && (
        <span 
          className={cn(
            'absolute bottom-0 right-0 block rounded-full border-2 border-white',
            statusClasses[status],
            size === 'xs' ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5'
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
