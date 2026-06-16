import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockTeams } from '@/data/mockData';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Plus,
  Search,
  Users,
  Folder,
  Calendar,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TeamsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const canCreateTeam = user?.isSuperAdmin || user?.role === 'admin' || user?.role === 'manager';

  const filteredTeams = mockTeams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Teams</h1>
            <p className="text-muted-foreground">
              Organize your team members and collaborate effectively
            </p>
          </div>
          {canCreateTeam && (
            <Button onClick={() => navigate('/teams/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Teams Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map(team => (
            <Card
              key={team.id}
              className="transition-all hover:shadow-elevated cursor-pointer"
              onClick={() => navigate(`/teams/${team.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: team.color }}>
                      <Folder className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {team.description}
                    </CardDescription>
                  </div>
                  {canCreateTeam && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/teams/${team.id}/edit`);
                        }}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => e.stopPropagation()}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Team Members */}
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{team.members.length} Members</span>
                  </div>
                  <div className="flex -space-x-2">
                    {team.members.slice(0, 3).map(member => (
                      <Avatar key={member.id} className="h-8 w-8 border-2 border-card">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {team.members.length > 3 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium">
                        +{team.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(team.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-lg font-medium">No teams found</p>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search' : 'Create your first team to get started'}
            </p>
            {canCreateTeam && !searchQuery && (
              <Button
                onClick={() => navigate('/teams/create')}
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
