import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoleBadge } from '@/components/StatusBadge';
import { EditRoleDialog } from '@/components/team/EditRoleDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  MoreVertical,
  Mail,
  Users,
  Loader2,
  Key,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/types';

export default function EmployeesPage() {
  const { user, getAllUsers, updateUserRole, resetUserPassword } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  // Load users on component mount
  useEffect(() => {
    setUsers(getAllUsers());
    const interval = setInterval(() => {
      setUsers(getAllUsers());
    }, 1000);
    return () => clearInterval(interval);
  }, [getAllUsers]);

  // Redirect if not admin or superadmin
  if (!user || (!user.isSuperAdmin && user.role !== 'admin')) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium">Access Denied</p>
          <p className="text-muted-foreground">Only admins can view this page</p>
        </div>
      </MainLayout>
    );
  }

  const filteredUsers = user?.isSuperAdmin
    ? users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users.filter(u =>
        !u.isSuperAdmin && (
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );

  // Show superadmin count even to non-superadmins
  const getSuperAdminCount = () => users.filter(u => u.isSuperAdmin).length;

  const getRoleCounts = () => {
    const visibleUsers = user?.isSuperAdmin ? users : users.filter(u => !u.isSuperAdmin);
    const superAdminUsers = users.filter(u => u.isSuperAdmin);
    return {
      totalUsers: visibleUsers.length,
      admins: visibleUsers.filter(u => u.role === 'admin' && !u.isSuperAdmin).length,
      managers: visibleUsers.filter(u => u.role === 'manager').length,
      employees: visibleUsers.filter(u => u.role === 'employee').length,
      superAdmins: superAdminUsers.length,
    };
  };

  const counts = getRoleCounts();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Employees</h1>
          <p className="text-muted-foreground">
            Manage all employees, managers, admins, and super admins in the system
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{counts.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Super Admins</p>
                  <p className="text-2xl font-bold">{counts.superAdmins}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold">{counts.admins}</p>
                </div>
                <Users className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Managers</p>
                  <p className="text-2xl font-bold">{counts.managers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Employees Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={employee.avatar} />
                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{employee.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{employee.username}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {employee.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={employee.role} isSuperAdmin={employee.isSuperAdmin} />
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUserForRole(employee);
                                setIsEditRoleOpen(true);
                              }}
                            >
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUserForPassword(employee);
                                setIsResetPasswordOpen(true);
                              }}
                              disabled={employee.isSuperAdmin && !user?.isSuperAdmin}
                            >
                              <Key className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              disabled={employee.isSuperAdmin}
                              title={employee.isSuperAdmin ? 'Cannot delete super admin' : ''}
                            >
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-lg font-medium">No employees found</p>
                <p className="text-muted-foreground">Try adjusting your search</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Role Dialog */}
        <EditRoleDialog
          open={isEditRoleOpen}
          onOpenChange={setIsEditRoleOpen}
          user={selectedUserForRole}
          onRoleChange={async (userId, newRole) => {
            const success = await updateUserRole(userId, newRole);
            if (success) {
              setUsers(getAllUsers());
            }
            return success;
          }}
        />
      </div>
    </MainLayout>
  );
}
