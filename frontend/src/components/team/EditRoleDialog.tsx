import { useState } from 'react';
import { User, UserRole } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onRoleChange: (userId: string, newRole: UserRole) => Promise<boolean>;
}

export function EditRoleDialog({
  open,
  onOpenChange,
  user,
  onRoleChange,
}: EditRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOpenChange = (newOpen: boolean) => {
    if (user) {
      setSelectedRole(user.role);
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async () => {
    if (!user || !selectedRole) return;

    setIsLoading(true);
    try {
      const success = await onRoleChange(user.id, selectedRole as UserRole);
      if (success) {
        toast({
          title: 'Role updated',
          description: `${user.name} is now a ${selectedRole}`,
        });
        handleOpenChange(false);
      } else {
        toast({
          title: 'Failed to update role',
          description: 'Please try again',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>
            Change the role for {user.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>User</Label>
            <div className="text-sm text-muted-foreground">{user.name}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">New Role *</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !selectedRole || selectedRole === user.role}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
