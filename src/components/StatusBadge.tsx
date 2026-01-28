import { Badge } from '@/components/ui/badge';
import { TaskStatus, TaskPriority, UserRole } from '@/types';
import { Circle, Clock, Eye, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: TaskStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    'new': { label: 'New', variant: 'status-new' as const, icon: Circle },
    'in-progress': { label: 'In Progress', variant: 'status-in-progress' as const, icon: Clock },
    'review': { label: 'Review', variant: 'status-review' as const, icon: Eye },
    'done': { label: 'Done', variant: 'status-done' as const, icon: CheckCircle2 },
  };

  const { label, variant, icon: Icon } = config[status];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = {
    'low': { label: 'Low', variant: 'priority-low' as const },
    'medium': { label: 'Medium', variant: 'priority-medium' as const },
    'high': { label: 'High', variant: 'priority-high' as const },
    'urgent': { label: 'Urgent', variant: 'priority-urgent' as const },
  };

  const { label, variant } = config[priority];

  return <Badge variant={variant}>{label}</Badge>;
}

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = {
    'admin': { label: 'Admin', variant: 'role-admin' as const },
    'manager': { label: 'Manager', variant: 'role-manager' as const },
    'employee': { label: 'Employee', variant: 'role-employee' as const },
  };

  const { label, variant } = config[role];

  return <Badge variant={variant}>{label}</Badge>;
}
