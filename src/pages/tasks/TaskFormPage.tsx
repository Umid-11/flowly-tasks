import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { mockTasks, mockUsers } from '@/data/mockData';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TaskStatus, TaskPriority } from '@/types';

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['new', 'in-progress', 'review', 'done']),
  assigneeId: z.string().optional(),
  deadline: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function TaskFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!id;
  const existingTask = isEditing ? mockTasks.find(t => t.id === id) : null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: existingTask ? {
      title: existingTask.title,
      description: existingTask.description,
      priority: existingTask.priority,
      status: existingTask.status,
      assigneeId: existingTask.assigneeId || '',
      deadline: existingTask.deadline ? new Date(existingTask.deadline).toISOString().split('T')[0] : '',
    } : {
      priority: 'medium',
      status: 'new',
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: isEditing ? 'Task updated' : 'Task created',
        description: isEditing 
          ? 'Your task has been updated successfully.' 
          : 'Your new task has been created.',
      });
      navigate('/tasks');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const teamMembers = mockUsers.filter(u => u.role !== 'admin');

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  {...register('title')}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the task in detail"
                  rows={5}
                  {...register('description')}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Priority */}
                <div className="space-y-2">
                  <Label>Priority *</Label>
                  <Select
                    defaultValue={watch('priority')}
                    onValueChange={(value) => setValue('priority', value as TaskPriority)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select
                    defaultValue={watch('status')}
                    onValueChange={(value) => setValue('status', value as TaskStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Assignee */}
                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Select
                    value={watch('assigneeId') || 'unassigned'}
                    onValueChange={(value) =>
                      setValue('assigneeId', value === 'unassigned' ? '' : value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to someone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <Label htmlFor="deadline">Due Date</Label>
                  <div className="relative">
                    <Input
                      id="deadline"
                      type="date"
                      {...register('deadline')}
                      className="pl-9"
                    />
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Save Changes' : 'Create Task'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
