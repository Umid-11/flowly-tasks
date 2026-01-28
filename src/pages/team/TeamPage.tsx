import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers, mockTasks } from '@/data/mockData';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoleBadge } from '@/components/StatusBadge';
import {
  Search,
  Plus,
  Mail,
  MoreVertical,
  CheckSquare,
  MessageSquare,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

export default function TeamPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = mockUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTaskCount = (userId: string) => {
    return mockTasks.filter(t => t.assigneeId === userId && t.status !== 'done').length;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Team</h1>
            <p className="text-muted-foreground">
              {isAdmin ? 'Manage team members and roles' : 'View your team members'}
            </p>
          </div>
          {isAdmin && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Team Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map(member => (
            <Card key={member.id} className="transition-all hover:shadow-elevated">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.department}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Role</DropdownMenuItem>
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{member.email}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <RoleBadge role={member.role} />
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <CheckSquare className="h-4 w-4" />
                      <span>{getTaskCount(member.id)} active tasks</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link to="/chat" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </Link>
                  <Link to={`/tasks?assignee=${member.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Tasks
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium">No team members found</p>
            <p className="text-muted-foreground">Try adjusting your search</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
