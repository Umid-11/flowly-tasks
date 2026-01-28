import { Link } from 'react-router-dom';
import { Task } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { Calendar, MessageSquare } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'done';
  const isDueToday = task.deadline && isToday(new Date(task.deadline));

  return (
    <Link to={`/tasks/${task.id}`}>
      <Card className="group h-full transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5">
        <CardContent className="p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
          
          <h3 className="mb-2 font-semibold leading-tight group-hover:text-primary transition-colors">
            {task.title}
          </h3>
          
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {task.description}
          </p>

          {task.deadline && (
            <div
              className={cn(
                'flex items-center gap-1.5 text-xs',
                isOverdue ? 'text-destructive' : isDueToday ? 'text-warning' : 'text-muted-foreground'
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {isOverdue ? 'Overdue: ' : isDueToday ? 'Due today: ' : 'Due: '}
                {format(new Date(task.deadline), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t px-4 py-3">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              {task.assignee ? (
                <>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignee.avatar} />
                    <AvatarFallback className="text-xs">
                      {task.assignee.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {task.assignee.name}
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Unassigned</span>
              )}
            </div>

            {task.comments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{task.comments.length}</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
