import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockTasks } from '@/data/mockData';
import { MainLayout } from '@/components/layout/MainLayout';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { TaskStatus, TaskPriority } from '@/types';
import { cn } from '@/lib/utils';

export default function TasksPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter tasks based on role
  const baseTasks = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return mockTasks;
    if (user.role === 'manager') {
      return mockTasks.filter(t => ['3', '4', '5'].includes(t.assigneeId || ''));
    }
    return mockTasks.filter(t => t.assigneeId === user.id || t.assigneeId === '3');
  }, [user]);

  // Apply filters
  const filteredTasks = useMemo(() => {
    return baseTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority && !task.isDeleted;
    });
  }, [baseTasks, search, statusFilter, priorityFilter]);

  const hasActiveFilters = search !== '' || statusFilter !== 'all' || priorityFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  // Group tasks by status for kanban view
  const tasksByStatus = {
    new: filteredTasks.filter(t => t.status === 'new'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    review: filteredTasks.filter(t => t.status === 'review'),
    done: filteredTasks.filter(t => t.status === 'done'),
  };

  const canCreateTask = user?.role === 'admin' || user?.role === 'manager';

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Tasks</h1>
            <p className="text-muted-foreground">
              {user?.role === 'admin' 
                ? 'Manage all tasks across the organization'
                : user?.role === 'manager'
                ? 'Manage your team\'s tasks'
                : 'View and update your assigned tasks'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex rounded-lg border p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {canCreateTask && (
              <Link to="/tasks/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <TaskFilters
          search={search}
          onSearchChange={setSearch}
          status={statusFilter}
          onStatusChange={setStatusFilter}
          priority={priorityFilter}
          onPriorityChange={setPriorityFilter}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* View Modes */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({filteredTasks.length})</TabsTrigger>
            <TabsTrigger value="new">New ({tasksByStatus.new.length})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({tasksByStatus['in-progress'].length})</TabsTrigger>
            <TabsTrigger value="review">Review ({tasksByStatus.review.length})</TabsTrigger>
            <TabsTrigger value="done">Done ({tasksByStatus.done.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {viewMode === 'grid' ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
            {filteredTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg font-medium">No tasks found</p>
                <p className="text-muted-foreground">
                  {hasActiveFilters ? 'Try adjusting your filters' : 'Create a new task to get started'}
                </p>
              </div>
            )}
          </TabsContent>

          {(['new', 'in-progress', 'review', 'done'] as const).map(status => (
            <TabsContent key={status} value={status} className="mt-6">
              {viewMode === 'grid' ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {tasksByStatus[status].map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {tasksByStatus[status].map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
              {tasksByStatus[status].length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">No tasks in this status</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
}
