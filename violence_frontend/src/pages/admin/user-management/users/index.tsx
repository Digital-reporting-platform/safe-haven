import { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pencil, Plus, RefreshCw, Search, ShieldCheck, Trash2, Users, Eye, Ban, CheckCircle2, XCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { AddUserModal } from '@/components/ui/AddUserModal';
import { EditUserModal } from '@/components/ui/EditUserModal';
import { UserRole, UserStatus } from '@/types/user';
import {
  adminUserService,
  ADMIN_EDITABLE_ROLES,
  type AdminUser,
} from '@/services/adminUserService';
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

export function UsersPage() {
  type AssignableUserRole = (typeof ADMIN_EDITABLE_ROLES)[number];

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningUser, setAssigningUser] = useState<AdminUser | null>(null);
  const [assignRole, setAssignRole] = useState<AssignableUserRole>(
    UserRole.SURVIVOR,
  );
  const [assignStatus, setAssignStatus] = useState<UserStatus>(UserStatus.ACTIVE);
  const [isAssigning, setIsAssigning] = useState(false);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [search, setSearch] = useState('');

  const roleOrder: UserRole[] = [
    UserRole.ADMIN,
    UserRole.MODERATOR,
    UserRole.COUNSELOR,
    UserRole.MEDICAL_PROFESSIONAL,
    UserRole.LEGAL_ADVISOR,
    UserRole.SURVIVOR,
  ];

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const users = await adminUserService.getUsers();
      setUsers(users);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to load users.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserAdded = () => {
    fetchUsers();
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUserUpdated = () => {
    fetchUsers();
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleOpenAssign = (user: AdminUser) => {
    setAssigningUser(user);
    if ((ADMIN_EDITABLE_ROLES as readonly string[]).includes(user.role)) {
      setAssignRole(user.role as AssignableUserRole);
    } else {
      setAssignRole(UserRole.SURVIVOR);
    }
    setAssignStatus(user.status);
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!assigningUser) return;
    setIsAssigning(true);
    try {
      await adminUserService.updateUser(assigningUser.id, {
        role: assignRole,
        status: assignStatus,
      });
      toast.success('User role assignment updated');
      setIsAssignModalOpen(false);
      setAssigningUser(null);
      await fetchUsers();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to assign role';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    const confirmed = window.confirm(
      `Delete user ${formatName(user)} (${user.email})?`,
    );
    if (!confirmed) return;

    try {
      await adminUserService.deleteUser(user.id);
      toast.success(`User deleted: ${user.email}`);
      fetchUsers();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete user.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  const handleViewUser = (user: AdminUser) => {
    toast.info(
      <div className="space-y-1">
        <p className="font-medium">{formatName(user)}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
        <p className="text-xs text-muted-foreground">Joined: {formatDate(user.createdAt)}</p>
        <p className="text-xs text-muted-foreground">Status: {user.status}</p>
        <p className="text-xs text-muted-foreground">
          Email: {user.isEmailVerified ? 'Verified' : 'Not verified'}
        </p>
      </div>,
      { duration: 5000 }
    );
  };

  const handleSuspendUser = async (user: AdminUser) => {
    const confirmed = window.confirm(
      `Suspend user ${formatName(user)} (${user.email})?\n\nThey will not be able to login or submit reports.`,
    );
    if (!confirmed) return;

    try {
      await adminUserService.updateUser(user.id, { status: UserStatus.SUSPENDED });
      toast.success(`User suspended: ${user.email}`);
      fetchUsers();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to suspend user.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  const handleActivateUser = async (user: AdminUser) => {
    try {
      await adminUserService.updateUser(user.id, { status: UserStatus.ACTIVE });
      toast.success(`User activated: ${user.email}`);
      fetchUsers();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to activate user.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  const handleDeactivateUser = async (user: AdminUser) => {
    const confirmed = window.confirm(
      `Deactivate user ${formatName(user)} (${user.email})?\n\nAccount will be disabled but data will be kept.`,
    );
    if (!confirmed) return;

    try {
      await adminUserService.updateUser(user.id, { status: UserStatus.INACTIVE });
      toast.success(`User deactivated: ${user.email}`);
      fetchUsers();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to deactivate user.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  const handleResendInvitation = async (user: AdminUser) => {
    const confirmed = window.confirm(
      `Resend invitation to ${formatName(user)} (${user.email})?\n\nA new activation code will be sent.`,
    );
    if (!confirmed) return;

    try {
      const result = await adminUserService.resendInvitation(user.email);
      toast.success(result.message || `Invitation resent to ${user.email}`);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to resend invitation.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  const filteredUsers = useMemo(() => {
    const key = search.trim().toLowerCase();
    return users.filter((user) => {
      const roleMatches = roleFilter === 'all' || user.role === roleFilter;
      if (!key) return roleMatches;

      const target = [
        user.firstName || '',
        user.lastName || '',
        user.email,
        user.phone || '',
      ]
        .join(' ')
        .toLowerCase();

      return roleMatches && target.includes(key);
    });
  }, [users, roleFilter, search]);

  const groupedUsers = useMemo(() => {
    const grouped = new Map<UserRole, AdminUser[]>();
    roleOrder.forEach((role) => grouped.set(role, []));

    filteredUsers.forEach((user) => {
      const current = grouped.get(user.role) || [];
      current.push(user);
      grouped.set(user.role, current);
    });

    return roleOrder
      .map((role) => ({ role, users: grouped.get(role) || [] }))
      .filter((group) => group.users.length > 0);
  }, [filteredUsers, roleOrder]);

  const formatName = (user: AdminUser) => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || 'Unnamed User';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="mx-6 px-4 py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6B705C] shadow-lg"
               style={{ boxShadow: '0 10px 25px -5px rgba(107, 112, 92, 0.35)' }}>
            <Users className="h-6 w-6 text-[#FDFDF5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#4A4D42]">User Management</h1>
            <p className="text-[#6B705C] mt-1 text-sm">
              Manage system users, roles, and access permissions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchUsers}
            disabled={isLoading}
            className="h-9 border-[#DAD8CE] bg-white px-3 text-sm font-medium text-[#4A4D42] shadow-sm hover:bg-[#F5F4F0] hover:text-[#3D4035]"
          >
            <RefreshCw className={`mr-1.5 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 bg-[#C15B3E] px-3 text-sm font-medium text-white shadow-sm hover:bg-[#A54B34]"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <Card className="mb-6 border-[#DAD8CE] shadow-sm">
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Label htmlFor="userSearch" className="text-xs font-semibold uppercase tracking-wide text-[#6B705C]">
                Search
              </Label>
              <div className="relative mt-1.5">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6B705C]" />
                <Input
                  id="userSearch"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, phone..."
                  className="h-9 border-[#DAD8CE] pl-10 text-sm placeholder:text-[#CCC9BC]"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-[#6B705C]">Role Filter</Label>
              <Select
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value as UserRole | 'all')}
              >
                <SelectTrigger className="mt-1.5 h-9 border-[#DAD8CE] text-sm">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {roleOrder.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isLoading && filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-muted-foreground py-8 text-center">
            No users found.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {groupedUsers.map((group) => {
          // Theme color coding by role
          const getRoleStyles = (role: UserRole) => {
            switch (role) {
              case UserRole.MEDICAL_PROFESSIONAL:
                return { border: 'border-l-[#6B705C]', bg: 'bg-[#F5F4F0]' };
              case UserRole.LEGAL_ADVISOR:
                return { border: 'border-l-[#C15B3E]', bg: 'bg-[#FEF5F2]' };
              case UserRole.ADMIN:
                return { border: 'border-l-[#414435]', bg: 'bg-[#F5F4F0]' };
              case UserRole.MODERATOR:
                return { border: 'border-l-[#DDA15E]', bg: 'bg-[#FEFAF5]' };
              case UserRole.COUNSELOR:
                return { border: 'border-l-[#5D624F]', bg: 'bg-[#F5F4F0]' };
              default:
                return { border: 'border-l-[#CCC9BC]', bg: 'bg-[#FDFDF5]' };
            }
          };
          const styles = getRoleStyles(group.role);

          return (
            <Card key={group.role} className={`overflow-hidden border-l-4 ${styles.border} shadow-sm`}>
              <CardHeader className={`${styles.bg} border-b py-4`}>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <span>{group.role.replace(/_/g, ' ')}</span>
                  <Badge variant="secondary" className="ml-2 font-medium">
                    {group.users.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F5F4F0] hover:bg-[#F5F4F0]">
                        <TableHead className="h-10 w-[40%] text-xs font-semibold uppercase tracking-wide text-[#6B705C]">
                          User
                        </TableHead>
                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wide text-[#6B705C]">
                          Status
                        </TableHead>
                        <TableHead className="h-10 text-right text-xs font-semibold uppercase tracking-wide text-[#6B705C]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.users.map((user, index) => (
                        <TableRow
                          key={user.id}
                          className={index % 2 === 1 ? 'bg-[#FDFDF5]' : ''}
                        >
                          <TableCell className="py-2.5">
                            <div className="font-medium text-[#4A4D42]">{formatName(user)}</div>
                            <div className="flex items-center gap-2 text-xs text-[#6B705C]">
                              <span>{user.email}</span>
                              {!user.isEmailVerified && (
                                <Badge variant="outline" className="bg-[#FEFAF5] text-[#DDA15E] border-[#F1D6B5] text-[10px] h-4 px-1.5">
                                  Unverified
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                user.status === UserStatus.ACTIVE
                                  ? 'bg-[#F5F4F0] text-[#5D624F]'
                                  : user.status === UserStatus.INACTIVE
                                    ? 'bg-[#E8E7E0] text-[#6B705C]'
                                    : user.status === UserStatus.INVITED
                                      ? 'bg-[#FEFAF5] text-[#DDA15E] border border-[#F1D6B5]'
                                      : 'bg-[#FCEAE4] text-[#C15B3E]'
                              }`}
                            >
                              {user.status === UserStatus.INVITED ? (
                                <span className="flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#DDA15E] animate-pulse" />
                                  INVITED (Pending)
                                </span>
                              ) : (
                                user.status
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="py-2.5 text-right">
                            <div className="flex justify-end gap-1">
                              {user.role === UserRole.SURVIVOR ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewUser(user)}
                                    className="h-7 w-7 p-0 text-[#6B705C] hover:bg-[#F5F4F0] hover:text-[#4A4D42]"
                                    title="View Details"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                  {user.status === UserStatus.ACTIVE ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSuspendUser(user)}
                                      className="h-7 w-7 p-0 text-[#C15B3E] hover:bg-[#FCEAE4] hover:text-[#A54B34]"
                                      title="Suspend User"
                                    >
                                      <Ban className="h-3.5 w-3.5" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleActivateUser(user)}
                                      className="h-7 w-7 p-0 text-[#5D624F] hover:bg-[#F5F4F0] hover:text-[#4A4D42]"
                                      title="Activate User"
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  {user.status === UserStatus.ACTIVE && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeactivateUser(user)}
                                      className="h-7 w-7 p-0 text-[#6B705C] hover:bg-[#E8E7E0] hover:text-[#4A4D42]"
                                      title="Deactivate User"
                                    >
                                      <XCircle className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                </>
                              ) : (
                                <>
                                  {user.status === UserStatus.INVITED ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleResendInvitation(user)}
                                      className="h-7 w-7 p-0 text-[#DDA15E] hover:bg-[#FEFAF5] hover:text-[#C58F54]"
                                      title="Resend Invitation"
                                    >
                                      <RefreshCw className="h-3.5 w-3.5" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleOpenAssign(user)}
                                      className="h-7 w-7 p-0 text-[#6B705C] hover:bg-[#F5F4F0] hover:text-[#4A4D42]"
                                      title="Assign"
                                    >
                                      <ShieldCheck className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditUser(user)}
                                    className="h-7 w-7 p-0 text-[#6B705C] hover:bg-[#F5F4F0] hover:text-[#4A4D42]"
                                    title="Edit"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user)}
                                    className="h-7 w-7 p-0 text-[#6B705C] hover:bg-[#FCEAE4] hover:text-[#C15B3E]"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-muted-foreground mt-8 text-center text-sm">
        Total Users: {filteredUsers.length}
        {roleFilter !== 'all' || search.trim()
          ? ` (filtered from ${users.length})`
          : ''}
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onUserAdded={handleUserAdded}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setSelectedUser(null);
        }}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />

      <Dialog
        open={isAssignModalOpen}
        onOpenChange={(open) => {
          if (isAssigning) return;
          setIsAssignModalOpen(open);
          if (!open) setAssigningUser(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign User Role</DialogTitle>
            <DialogDescription>
              Assign role and status for this account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">
                {assigningUser ? formatName(assigningUser) : ''}
              </p>
              <p className="text-muted-foreground text-xs">
                {assigningUser?.email || ''}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={assignRole}
                onValueChange={(value) =>
                  setAssignRole(value as AssignableUserRole)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOrder.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={assignStatus}
                onValueChange={(value) => setAssignStatus(value as UserStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserStatus.ACTIVE}>ACTIVE</SelectItem>
                  <SelectItem value={UserStatus.INACTIVE}>INACTIVE</SelectItem>
                  <SelectItem value={UserStatus.SUSPENDED}>SUSPENDED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignModalOpen(false)}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignSubmit} disabled={isAssigning || !assigningUser}>
              {isAssigning ? 'Assigning...' : 'Save Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
