
import React from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = 'User Avatar', 
  size = 'md',
  status
}) => {
  const { user } = useAuth();
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

  // Get initials from user's full name or email
  const getInitials = () => {
    if (!user) return '?';
    
    const fullName = user.user_metadata?.full_name;
    if (fullName) return fullName.charAt(0).toUpperCase();
    
    const email = user.email || '';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="relative">
      <div 
        className={cn(
          'rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-bettr-blue text-white',
          sizeClasses[size]
        )}
      >
        {src ? (
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-lg font-semibold">{getInitials()}</span>
        )}
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
