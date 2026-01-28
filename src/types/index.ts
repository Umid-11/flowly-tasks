export type UserRole = 'employee' | 'manager' | 'admin';

export type TaskStatus = 'new' | 'in-progress' | 'review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  assignee?: User;
  creatorId: string;
  creator?: User;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  comments: TaskComment[];
  isDeleted?: boolean;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  user?: User;
  content: string;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  userId: string;
  user?: User;
  action: string;
  details?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'task_assigned' | 'task_status' | 'comment' | 'chat_message' | 'deadline';
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'team' | 'project' | 'direct';
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  createdAt: Date;
}

export interface ChatParticipant {
  id: string;
  roomId: string;
  userId: string;
  user?: User;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  sender?: User;
  content: string;
  attachments?: Attachment[];
  readBy: string[];
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  unreadMessages: number;
  unreadNotifications: number;
}
