import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats, mockTasks, mockNotifications } from '@/data/mockData';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Bell,
  Plus,
  ArrowRight,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  const stats = getDashboardStats(user.id, user.role);
  
  // Filter tasks based on role
  const userTasks = user.role === 'admin' 
    ? mockTasks 
    : user.role === 'manager'
    ? mockTasks.filter(t => ['3', '4', '5'].includes(t.assigneeId || ''))
    : mockTasks.filter(t => t.assigneeId === user.id || t.assigneeId === '3');

  const recentTasks = userTasks.slice(0, 5);
  const recentNotifications = mockNotifications.filter(n => !n.isRead).slice(0, 3);

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'In Progress',
      value: stats.inProgressTasks,
      icon: Clock,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'Overdue',
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              Welcome back, {user.name.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your tasks today.
            </p>
          </div>
          {(user.role === 'admin' || user.role === 'manager') && (
            <Link to="/tasks/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </Link>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="animate-slide-in-up">
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Tasks */}
          <Card className="animate-slide-in-up">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>Your latest assigned tasks</CardDescription>
              </div>
              <Link to="/tasks">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    className="group flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="font-medium leading-none group-hover:text-primary">
                        {task.title}
                      </p>
                      <p className="line-clamp-1 text-sm text-muted-foreground">
                        {task.description}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </div>
                    {task.assignee && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={task.assignee.avatar} />
                        <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                  </Link>
                ))}
                {recentTasks.length === 0 && (
                  <p className="py-8 text-center text-muted-foreground">
                    No tasks assigned yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications & Quick Actions */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card className="animate-slide-in-up">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Recent activity updates</CardDescription>
                </div>
                <Link to="/notifications">
                  <Button variant="ghost" size="sm">
                    View all
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                    >
                      <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentNotifications.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      All caught up!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="animate-slide-in-up">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks at your fingertips</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/chat">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Open Chat
                    </Button>
                  </Link>
                  <Link to="/tasks">
                    <Button variant="outline" className="w-full justify-start">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      View Tasks
                    </Button>
                  </Link>
                  {(user.role === 'admin' || user.role === 'manager') && (
                    <>
                      <Link to="/team">
                        <Button variant="outline" className="w-full justify-start">
                          <Users className="mr-2 h-4 w-4" />
                          Team
                        </Button>
                      </Link>
                      <Link to="/tasks/new">
                        <Button variant="outline" className="w-full justify-start">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Task
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
