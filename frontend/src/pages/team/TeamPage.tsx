import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoleBadge } from '@/components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types';
import {
  Search,
  Plus,
  Mail,
  Trash2,
  Users,
  Calendar,
  Loader2,
  UserPlus,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DBTeam {
  id: number;
  name: string;
  createdAt: string;
}

export default function TeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [teams, setTeams] = useState<DBTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isTeamsLoading, setIsTeamsLoading] = useState(false);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Create Team state
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const mapDBUser = (u: any): User => ({
    id: u.id.toString(),
    name: `${u.firstName} ${u.lastName}`,
    username: u.userName || '',
    email: u.email,
    role:
      (u.roleId === 2
        ? 'admin'
        : u.roleId === 3
          ? 'manager'
          : 'employee') as UserRole,
    isSuperAdmin: u.roleId === 1,
    department: 'Development',
    status: u.isActive ? 'active' : 'inactive',
    isActive: u.isActive,
    avatar:
      u.avatarUrl ||
      `https://ui-avatars.com/api/?name=${u.firstName}+${u.lastName}`,
    createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
  });

  const fetchTeams = async () => {
    setIsTeamsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5064/api/team', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      toast({
        title: 'Xəta',
        description: 'Komandaları yükləmək mümkün olmadı.',
        variant: 'destructive',
      });
    } finally {
      setIsTeamsLoading(false);
    }
  };

  const fetchMembers = async (teamId: number) => {
    setIsMembersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5064/api/team/${teamId}/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(data.map(mapDBUser).filter((u: User) => !u.isSuperAdmin));
      }
    } catch (err) {
      console.error('Failed to fetch team members:', err);
      toast({
        title: 'Xəta',
        description: 'Komanda üzvlərini yükləmək mümkün olmadı.',
        variant: 'destructive',
      });
    } finally {
      setIsMembersLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('http://localhost:5064/api/users');
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data.map(mapDBUser).filter((u: User) => !u.isSuperAdmin));
      }
    } catch (err) {
      console.error('Failed to fetch all users:', err);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (selectedTeamId !== null) {
      fetchMembers(selectedTeamId);
    } else {
      setMembers([]);
    }
  }, [selectedTeamId]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setIsCreating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5064/api/team/create-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newTeamName }),
      });

      if (response.ok) {
        const newId = await response.json();
        toast({
          title: 'Uğurlu',
          description: `"${newTeamName}" komandası uğurla yaradıldı.`,
        });
        setNewTeamName('');
        setIsCreateTeamOpen(false);
        await fetchTeams();
        setSelectedTeamId(newId);
      } else {
        const errData = await response.json().catch(() => ({}));
        toast({
          title: 'Xəta',
          description: errData.message || 'Komanda yaradıla bilmədi.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Xəta',
        description: 'Komanda yaradılarkən gözlənilməz xəta baş verdi.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedTeamId) return;
    setIsActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5064/api/team/add-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId: selectedTeamId, userId: parseInt(userId) }),
      });

      if (response.ok) {
        toast({
          title: 'Uğurlu',
          description: 'İstifadəçi komandaya əlavə edildi.',
        });
        await fetchMembers(selectedTeamId);
      } else {
        const errData = await response.json().catch(() => ({}));
        toast({
          title: 'Xəta',
          description: errData.message || 'İstifadəçi əlavə edilə bilmədi.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Xəta',
        description: 'İstifadəçi əlavə edilərkən xəta baş verdi.',
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeamId) return;
    setIsActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5064/api/team/remove-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId: selectedTeamId, userId: parseInt(userId) }),
      });

      if (response.ok) {
        toast({
          title: 'Uğurlu',
          description: 'İstifadəçi komandadan silindi.',
        });
        await fetchMembers(selectedTeamId);
      } else {
        const errData = await response.json().catch(() => ({}));
        toast({
          title: 'Xəta',
          description: errData.message || 'İstifadəçi silinə bilmədi.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Xəta',
        description: 'İstifadəçi silinərkən xəta baş verdi.',
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  // Filter out users who are already members of the selected team, and only show active ones
  const availableUsersToAdd = allUsers.filter(
    u => u.status === 'active' && !members.some(m => m.id === u.id)
  );

  const canManage = user?.isSuperAdmin || user?.role === 'admin' || user?.role === 'manager';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
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
            <h1 className="text-2xl font-bold md:text-3xl">Komandalar</h1>
            <p className="text-muted-foreground">
              Layihə komandalarını idarə edin və onların üzvlərinə baxın
            </p>
          </div>
          {canManage && (
            <Button onClick={() => setIsCreateTeamOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Komanda
            </Button>
          )}
        </div>

        {/* Create Team Dialog */}
        <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Komanda Yarat</DialogTitle>
              <DialogDescription>
                Komandanın adını daxil edərək yeni bir əməkdaşlıq qrupu yaradın.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Komanda Adı *</Label>
                <Input
                  id="teamName"
                  placeholder="Məs. Frontend Pro, backend team"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  required
                />
              </div>
              <DialogFooter className="gap-2 pt-4 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateTeamOpen(false)}
                  disabled={isCreating}
                >
                  Ləğv et
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Yarat
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Main Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Teams list */}
          <div className="md:col-span-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Komanda axtar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {isTeamsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTeams.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Hər hansı bir komanda tapılmadı.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredTeams.map((team) => (
                  <Card
                    key={team.id}
                    className={`cursor-pointer transition-all hover:border-primary/50 ${
                      selectedTeamId === team.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : ''
                    }`}
                    onClick={() => setSelectedTeamId(team.id)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                          {team.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm line-clamp-1">{team.name}</h4>
                          <span className="text-xs text-muted-foreground">
                            Yaradılıb: {formatDate(team.createdAt)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Selected Team Members */}
          <div className="md:col-span-2">
            {selectedTeamId === null ? (
              <Card className="h-full min-h-[300px] flex flex-col items-center justify-center border-dashed text-center p-8">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <CardTitle className="text-lg font-medium text-muted-foreground mb-1">
                  Komanda seçilməyib
                </CardTitle>
                <CardDescription>
                  Üzvləri görmək və idarə etmək üçün soldakı siyahıdan bir komanda seçin.
                </CardDescription>
              </Card>
            ) : (
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3 border-b flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground text-sm font-bold">
                        {selectedTeam?.name.charAt(0).toUpperCase()}
                      </div>
                      {selectedTeam?.name}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Yaradılma tarixi: {selectedTeam && formatDate(selectedTeam.createdAt)}
                    </CardDescription>
                  </div>

                  {canManage && (
                    <div className="w-full sm:w-[220px]">
                      <Select
                        disabled={isActionLoading || availableUsersToAdd.length === 0}
                        onValueChange={handleAddMember}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={availableUsersToAdd.length === 0 ? "Əlavə ediləcək üzv yoxdur" : "Üzv əlavə et..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsersToAdd.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name} ({u.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="flex-1 p-6">
                  {isMembersLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <UserPlus className="h-10 w-10 mb-2 opacity-50" />
                      <p>Bu komandada hələ heç bir üzv yoxdur.</p>
                      {canManage && (
                        <p className="text-sm mt-1">Yuxarıdakı menyudan komandaya üzv əlavə edə bilərsiniz.</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-sm">{member.name}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span>{member.email}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <RoleBadge role={member.role} isSuperAdmin={member.isSuperAdmin} />
                            {canManage && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveMember(member.id)}
                                disabled={isActionLoading}
                                title="Komandadan sil"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
