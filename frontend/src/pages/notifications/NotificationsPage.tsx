import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockNotifications } from '@/data/mockData';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  CheckSquare,
  MessageSquare,
  Clock,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Notification } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(mockNotifications);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned': return CheckSquare;
      case 'task_status': return CheckSquare;
      case 'comment': return MessageSquare;
      case 'chat_message': return MessageSquare;
      case 'deadline': return Clock;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'task_assigned': return 'bg-primary/10 text-primary';
      case 'task_status': return 'bg-success/10 text-success';
      case 'comment': return 'bg-info/10 text-info';
      case 'chat_message': return 'bg-accent/10 text-accent';
      case 'deadline': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast({
      title: 'All notifications marked as read',
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({
      title: 'Notification deleted',
    });
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const Icon = getNotificationIcon(notification.type);
    const colorClass = getNotificationColor(notification.type);

    return (
      <Card className={cn(
        'transition-all hover:shadow-soft',
        !notification.isRead && 'border-l-4 border-l-primary'
      )}>
        <CardContent className="flex items-start gap-4 p-4">
          <div className={cn('rounded-lg p-2', colorClass)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
              </div>
              {!notification.isRead && (
                <Badge variant="default" className="shrink-0">New</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => markAsRead(notification.id)}
                title="Mark as read"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => deleteNotification(notification.id)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with your latest activity
            </p>
          </div>
          {unreadNotifications.length > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="read">
              Read ({readNotifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 space-y-3">
            {notifications.map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
            {notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-muted-foreground">
                  You're all caught up!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-6 space-y-3">
            {unreadNotifications.map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
            {unreadNotifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCheck className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">All caught up!</p>
                <p className="text-muted-foreground">
                  No unread notifications
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="read" className="mt-6 space-y-3">
            {readNotifications.map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
            {readNotifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">No read notifications</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
