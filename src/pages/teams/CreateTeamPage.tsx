import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers } from '@/data/mockData';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
});

type CreateTeamFormData = z.infer<typeof createTeamSchema>;

const teamColors = [
  '#3b82f6', // blue
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#ef4444', // red
  '#14b8a6', // teal
  '#f97316', // orange
];

export default function CreateTeamPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([user?.id || '']);
  const [selectedColor, setSelectedColor] = useState(teamColors[0]);

  const canCreateTeam = user?.isSuperAdmin || user?.role === 'admin' || user?.role === 'manager';

  if (!canCreateTeam) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium">Access Denied</p>
          <p className="text-muted-foreground">Only managers and admins can create teams</p>
          <Link to="/teams">
            <Button className="mt-4">Back to Teams</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
  });

  const onSubmit = async (data: CreateTeamFormData) => {
    if (selectedMembers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one team member',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: 'Team created!',
        description: `${data.name} has been created successfully.`,
      });

      navigate('/teams');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create team. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMemberObjects = mockUsers.filter(u => selectedMembers.includes(u.id));

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/teams">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Create Team</h1>
            <p className="text-muted-foreground">Set up a new team and add members</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Team Details</CardTitle>
              <CardDescription>
                Provide basic information about your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Team Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Team Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Engineering Team"
                    {...register('name')}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    placeholder="Describe your team's purpose and goals"
                    {...register('description')}
                    className={`min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary ${
                      errors.description ? 'border-destructive' : 'border-input'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                {/* Team Color */}
                <div className="space-y-2">
                  <Label>Team Color</Label>
                  <div className="flex gap-2">
                    {teamColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`h-10 w-10 rounded-lg border-2 transition-all ${
                          selectedColor === color
                            ? 'border-foreground'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Members */}
                <div className="space-y-3">
                  <Label>Team Members *</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-input p-4">
                    {mockUsers.map(member => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Checkbox
                          id={member.id}
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedMembers([...selectedMembers, member.id]);
                            } else {
                              setSelectedMembers(
                                selectedMembers.filter(id => id !== member.id)
                              );
                            }
                          }}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedMembers.length === 0 && (
                    <p className="text-sm text-destructive">Please select at least one member</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Team
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Team Icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-lg" style={{ backgroundColor: selectedColor }}>
                <div className="text-2xl font-bold text-white">
                  {selectedMemberObjects[0]?.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Team Members */}
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  {selectedMembers.length} Member{selectedMembers.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-2">
                  {selectedMemberObjects.map(member => (
                    <div key={member.id} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{member.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
