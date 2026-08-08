import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Users, Shield, Key, UserCheck, UserX, Crown, UserPlus, RefreshCw, ArrowRight } from 'lucide-react';
import { AddUserModal } from '@/components/ui/AddUserModal';
import { UserRole } from '@/types/user';
import { api } from '@/services/api/client';

type UserStats = {
  users: {
    total: number;
    active: number;
    inactive: number;
    byRole: Array<{ role: string; count: number }>;
  };
};

export function UserManagementPage() {
  const navigate = useNavigate();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentlyAddedUsers, setRecentlyAddedUsers] = useState<
    Array<{
      id: string;
      fullName: string;
      email: string;
      role: UserRole;
      place?: string;
      createdAt: string;
    }>
  >([]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/auth/stats');
      setStats(response.data);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to load user statistics';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const adminCount = useMemo(() => {
    return stats?.users?.byRole?.find((r) => r.role === 'ADMIN')?.count ?? 0;
  }, [stats]);

  const userStats = useMemo(() => {
    return [
      {
        title: 'Total Users',
        value: (stats?.users?.total ?? 0).toLocaleString(),
        icon: Users,
        color: 'text-[#6B705C]',
        borderColor: 'border-l-[#6B705C]',
        bgColor: 'bg-[#F5F4F0]',
        iconBg: 'bg-[#E8E7E0]',
      },
      {
        title: 'Active Users',
        value: (stats?.users?.active ?? 0).toLocaleString(),
        icon: UserCheck,
        color: 'text-[#5D624F]',
        borderColor: 'border-l-[#5D624F]',
        bgColor: 'bg-[#F5F4F0]',
        iconBg: 'bg-[#E8E7E0]',
      },
      {
        title: 'Inactive Users',
        value: (stats?.users?.inactive ?? 0).toLocaleString(),
        icon: UserX,
        color: 'text-[#C15B3E]',
        borderColor: 'border-l-[#C15B3E]',
        bgColor: 'bg-[#FEF5F2]',
        iconBg: 'bg-[#F8D4C7]',
      },
      {
        title: 'Admin Users',
        value: adminCount.toLocaleString(),
        icon: Crown,
        color: 'text-[#AD7D4A]',
        borderColor: 'border-l-[#DDA15E]',
        bgColor: 'bg-[#FEFAF5]',
        iconBg: 'bg-[#F7E8D1]',
      },
    ];
  }, [stats, adminCount]);

  const roleCount = stats?.users?.byRole?.length ?? 0;

  const managementSections = [
    {
      title: 'Users',
      description: 'View and manage all system users, edit profiles, and control access',
      count: stats?.users?.total ?? 0,
      path: 'users',
      icon: Users,
      color: 'text-[#6B705C]',
      borderColor: 'border-l-[#6B705C]',
      bgColor: 'bg-[#F5F4F0]',
    },
    {
      title: 'Roles',
      description: 'Manage user roles and permission assignments across the platform',
      count: roleCount,
      path: 'roles',
      icon: Shield,
      color: 'text-[#AD7D4A]',
      borderColor: 'border-l-[#DDA15E]',
      bgColor: 'bg-[#FEFAF5]',
    },
    {
      title: 'Permissions',
      description: 'Configure system permissions and access control policies',
      count: 6,
      path: 'permissions',
      icon: Key,
      color: 'text-[#C15B3E]',
      borderColor: 'border-l-[#C15B3E]',
      bgColor: 'bg-[#FEF5F2]',
    },
  ];

  const handleUserAdded = (user: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    place?: string;
    createdAt: string;
  }) => {
    setRecentlyAddedUsers((prev) => [user, ...prev].slice(0, 10));
  };

  return (
    <div className="mx-6 px-4 py-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6B705C]"
               style={{ boxShadow: '0 10px 25px -5px rgba(107, 112, 92, 0.35)' }}>
            <Users className="h-6 w-6 text-[#FDFDF5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#4A4D42]">User Management</h1>
            <p className="text-[#6B705C] mt-1 text-sm">
              Oversee user accounts, roles, permissions, and access control across the platform
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadStats}
            disabled={isLoading}
            className="h-9 border-[#DAD8CE] bg-white px-3 text-sm font-medium text-[#4A4D42] shadow-sm hover:bg-[#F5F4F0] hover:text-[#3D4035]"
          >
            <RefreshCw className={`mr-1.5 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setIsAddUserOpen(true)}
            className="h-9 bg-[#C15B3E] px-3 text-sm font-medium text-white shadow-sm hover:bg-[#A54B34]"
          >
            <UserPlus className="mr-1.5 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* User Statistics */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#4A4D42]">User Overview</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {userStats.map((stat, index) => (
            <Card key={index} className={`overflow-hidden border-l-4 ${stat.borderColor} shadow-sm`}>
              <CardContent className={`${stat.bgColor} pt-5`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[#6B705C]">{stat.title}</p>
                    <h2 className="mt-1 text-2xl font-bold text-[#4A4D42]">{stat.value}</h2>
                  </div>
                  <div className={`rounded-lg ${stat.iconBg} p-2.5`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Role Distribution */}
      {stats?.users?.byRole && stats.users.byRole.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#4A4D42]">Role Distribution</h2>
          <Card className="overflow-hidden border-[#DAD8CE] shadow-sm">
            <CardHeader className="border-b border-[#E8E7E0] bg-[#F5F4F0] py-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#4A4D42]">
                <div className="rounded-lg bg-[#F7F3E6] p-1.5">
                  <Shield className="h-4 w-4 text-[#6B705C]" />
                </div>
                Users by Role
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                {stats.users.byRole.map((roleStat) => (
                  <Badge
                    key={roleStat.role}
                    variant="secondary"
                    className="bg-[#F5F4F0] text-[#4A4D42] border border-[#DAD8CE] text-sm px-3 py-1"
                  >
                    <span className="font-medium">{roleStat.role.replace(/_/g, ' ')}:</span>
                    <span className="ml-1 text-[#6B705C]">{roleStat.count}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Management Sections */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#4A4D42]">Management Sections</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {managementSections.map((section, index) => (
            <Card
              key={index}
              className={`overflow-hidden border-l-4 ${section.borderColor} shadow-sm transition-shadow hover:shadow-md cursor-pointer`}
              onClick={() => navigate(section.path)}
            >
              <CardContent className={`${section.bgColor} p-5`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-white/60 p-2">
                      <section.icon className={`h-5 w-5 ${section.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#4A4D42]">{section.title}</h3>
                        <Badge
                          variant="secondary"
                          className="bg-white/80 text-[#6B705C] border border-[#DAD8CE] text-xs"
                        >
                          {isLoading ? '-' : section.count}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-[#6B705C] leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[#CCC9BC] hover:bg-white/60 hover:text-[#6B705C]"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent User Activity */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#4A4D42]">Recent Activity</h2>
        <Card className="overflow-hidden border-[#DAD8CE] shadow-sm">
          <CardHeader className="border-b border-[#E8E7E0] bg-[#F5F4F0] py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#4A4D42]">
              <div className="rounded-lg bg-[#F7F3E6] p-1.5">
                <Users className="h-4 w-4 text-[#6B705C]" />
              </div>
              User Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {recentlyAddedUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-4 rounded-lg border border-[#E8E7E0] bg-[#FDFDF5] p-3">
                  <div className="rounded-full bg-[#E8E7E0] p-2">
                    <UserPlus className="h-4 w-4 text-[#5D624F]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#4A4D42] text-sm">New user added by admin</p>
                    <p className="text-[#6B705C] text-xs">
                      {user.fullName} ({user.email}) as <span className="font-medium">{user.role}</span>
                      {user.place ? ` - ${user.place}` : ''}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-[#DAD8CE] text-[#6B705C]">
                    Just now
                  </Badge>
                </div>
              ))}
              <div className="flex items-center gap-4 rounded-lg border border-[#E8E7E0] bg-[#FDFDF5] p-3">
                <div className="rounded-full bg-[#F5F4F0] p-2">
                  <UserCheck className="h-4 w-4 text-[#5D624F]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#4A4D42] text-sm">New user registered</p>
                  <p className="text-[#6B705C] text-xs">john.doe@example.com</p>
                </div>
                <Badge variant="outline" className="text-[10px] border-[#DAD8CE] text-[#6B705C]">
                  5 min ago
                </Badge>
              </div>
              <div className="flex items-center gap-4 rounded-lg border border-[#E8E7E0] bg-[#FDFDF5] p-3">
                <div className="rounded-full bg-[#FEFAF5] p-2">
                  <Shield className="h-4 w-4 text-[#AD7D4A]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#4A4D42] text-sm">Role updated</p>
                  <p className="text-[#6B705C] text-xs">jane.smith promoted to <span className="font-medium">Moderator</span></p>
                </div>
                <Badge variant="outline" className="text-[10px] border-[#DAD8CE] text-[#6B705C]">
                  1 hour ago
                </Badge>
              </div>
              <div className="flex items-center gap-4 rounded-lg border border-[#E8E7E0] bg-[#FDFDF5] p-3">
                <div className="rounded-full bg-[#FEF5F2] p-2">
                  <Key className="h-4 w-4 text-[#C15B3E]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#4A4D42] text-sm">Permissions changed</p>
                  <p className="text-[#6B705C] text-xs">Admin permissions granted to support team</p>
                </div>
                <Badge variant="outline" className="text-[10px] border-[#DAD8CE] text-[#6B705C]">
                  2 hours ago
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddUserModal
        isOpen={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
}
