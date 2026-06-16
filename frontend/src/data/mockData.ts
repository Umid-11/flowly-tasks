import { Task, User, Notification, ChatRoom, ChatMessage, DashboardStats, Team } from '@/types';

export const mockUsers: User[] = [];

export const mockTeams: Team[] = [];

export const mockTasks: Task[] = [];

export const mockNotifications: Notification[] = [];

export const mockChatRooms: ChatRoom[] = [];

export const mockChatMessages: ChatMessage[] = [];

export const getDashboardStats = (userId: string, role: string, isSuperAdmin?: boolean): DashboardStats => {
  const userTasks = isSuperAdmin || role === 'admin'
    ? mockTasks 
    : role === 'manager'
    ? mockTasks.filter(t => ['3', '4', '5'].includes(t.assigneeId || ''))
    : mockTasks.filter(t => t.assigneeId === userId);

  return {
    totalTasks: userTasks.length,
    completedTasks: userTasks.filter(t => t.status === 'done').length,
    overdueTasks: userTasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length,
    inProgressTasks: userTasks.filter(t => t.status === 'in-progress').length,
    unreadMessages: 0,
    unreadNotifications: mockNotifications.filter(n => !n.isRead && n.userId === userId).length,
  };
};
