'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';

type Notification = {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  read: boolean;
  sender: string | null;
  relatedId?: string;
};

export function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      
      // Poll for new notifications every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const markAsRead = async (ids: string[]) => {
    if (ids.length === 0) return;
    
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds: ids }),
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          ids.includes(notification.id) 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };
  
  // Handle parent request response
  const handleParentRequest = async (relationshipId: string, accept: boolean) => {
    try {
      const response = await fetch('/api/parent-child', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          relationshipId,
          status: accept ? 'APPROVED' : 'REJECTED',
        }),
      });
      
      if (response.ok) {
        // Remove the notification from the list
        setNotifications(prev => 
          prev.filter(notification => 
            !(notification.type === 'PARENT_REQUEST' && notification.relatedId === relationshipId)
          )
        );
        
        // Show success message
        const message = accept ? 
          'Parent connection request accepted' : 
          'Parent connection request declined';
          
        // We would use toast here if available
        alert(message);
        
        // Close the popover
        setOpen(false);
      } else {
        throw new Error('Failed to process request');
      }
    } catch (error) {
      console.error('Error handling parent request:', error);
      alert('Error processing the parent request');
    }
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    
    // Mark all as read when opening the popover
    if (isOpen) {
      const unreadIds = notifications
        .filter(notification => !notification.read)
        .map(notification => notification.id);
      
      markAsRead(unreadIds);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (!session?.user) return null;

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] bg-red-500"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-[400px] overflow-auto" align="end">
        <div className="p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
        </div>
        
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div>
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-3 border-b hover:bg-muted/50 ${notification.read ? 'opacity-70' : 'bg-muted/20'}`}
              >
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">
                    {notification.type.replace(/_/g, ' ')}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
                <p className="text-sm mt-1">{notification.content}</p>
                {notification.sender && (
                  <p className="text-xs text-muted-foreground mt-1">
                    From: {notification.sender}
                  </p>
                )}
                
                {/* Add action buttons for parent requests */}
                {notification.type === 'PARENT_REQUEST' && notification.relatedId && (
                  <div className="mt-2 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="w-full" 
                      onClick={() => handleParentRequest(notification.relatedId!, true)}
                    >
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => handleParentRequest(notification.relatedId!, false)}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            ))}
            
            {notifications.length > 0 && (
              <div className="p-2 text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs w-full"
                  onClick={() => setNotifications([])}
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
