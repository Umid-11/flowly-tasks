import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockTeams } from '@/data/mockData';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoleBadge } from '@/components/StatusBadge';
import {
  ArrowLeft,
  Users,
  Calendar,
  Mail,
  Edit,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const team = mockTeams.find(t => t.id === id);

  if (!team) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium">Team not found</p>
          <Link to="/teams">
            <Button className="mt-4">Back to Teams</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const canEdit = user?.role === 'admin' || user?.role === 'manager' || user?.isSuperAdmin;
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
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Link to="/teams">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-xl font-bold text-white"
                  style={{ backgroundColor: team.color }}
                >
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold md:text-3xl">{team.name}</h1>
                  <p className="text-muted-foreground">{team.description}</p>
                </div>
              </div>
            </div>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(`/teams/${team.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Team Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {team.members.length} members in this team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {team.members.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-input p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <RoleBadge role={member.role} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Details Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Team Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{formatDate(team.createdAt)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Members</p>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{team.members.length} members</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Team Color</p>
                  <div
                    className="h-8 w-full rounded-lg"
                    style={{ backgroundColor: team.color }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {canEdit && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/teams/${team.id}/edit`)}>
                    Edit Team
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
