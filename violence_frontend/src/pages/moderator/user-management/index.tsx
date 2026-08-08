import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, UserCheck, UserX, Users, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { moderatorWorkflowService } from '@/services/moderatorWorkflowService';

const UserManagement = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<
    Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      flags: number;
      lastActive: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = async (term?: string) => {
    try {
      setIsLoading(true);
      const data = await moderatorWorkflowService.getUsers(term);
      setUsers(data);
    } catch (error: any) {
      console.error('Failed to load users', error);
      toast.error(error?.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()),
    );
  }, [users, search]);

  const setStatus = async (userId: string, status: 'ACTIVE' | 'SUSPENDED') => {
    try {
      setProcessingId(userId);
      await moderatorWorkflowService.updateUserStatus(userId, status);
      toast.success(`User status updated to ${status}`);
      await load(search);
    } catch (error: any) {
      console.error('Failed to update user status', error);
      toast.error(error?.message || 'Failed to update user status');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: {
        bg: 'rgba(var(--role-moderator-success-rgb), 0.1)',
        color: 'var(--role-moderator-success)',
        border: 'var(--role-moderator-success)',
        label: 'Active'
      },
      SUSPENDED: {
        bg: 'rgba(var(--role-moderator-alert-rgb), 0.1)',
        color: 'var(--role-moderator-alert)',
        border: 'var(--role-moderator-alert)',
        label: 'Suspended'
      },
      INACTIVE: {
        bg: 'var(--role-moderator-neutral)',
        color: 'var(--role-moderator-primary)',
        border: 'var(--role-moderator-primary)',
        label: 'Inactive'
      }
    };

    const style = styles[status as keyof typeof styles] || styles.INACTIVE;

    return (
      <Badge 
        variant="outline" 
        className="text-xs font-semibold"
        style={{ 
          backgroundColor: style.bg,
          color: style.color,
          borderColor: style.border
        }}
      >
        {style.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge 
        variant="outline" 
        className="text-xs"
        style={{ 
          backgroundColor: 'rgba(var(--role-moderator-primary-rgb), 0.1)',
          color: 'var(--role-moderator-primary)',
          borderColor: 'var(--role-moderator-primary)'
        }}
      >
        {role}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen pb-20 font-sans" style={{ backgroundColor: 'var(--role-moderator-bg)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8" style={{ color: 'var(--role-moderator-primary)' }} />
            <h1 className="text-4xl font-bold" style={{ color: 'var(--role-moderator-primary)' }}>
              Flagged Community Members
            </h1>
          </div>
          <p className="text-lg" style={{ color: 'var(--role-moderator-primary)', opacity: 0.7 }}>
            Manage users who have violated community guidelines or been reported
          </p>
        </div>

        {/* Search Card */}
        <Card className="mb-6 border-2" style={{ 
          borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.2)',
          boxShadow: '0 4px 12px rgba(var(--role-moderator-shadow-rgb), 0.1)'
        }}>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute top-3 left-3 h-5 w-5" style={{ color: 'var(--role-moderator-primary)', opacity: 0.5 }} />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                style={{ borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.3)' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card className="border-2" style={{ 
          borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.2)',
          boxShadow: '0 4px 12px rgba(var(--role-moderator-shadow-rgb), 0.1)'
        }}>
          <CardHeader className="border-b" style={{ borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.1)' }}>
            <CardTitle className="flex items-center gap-2" style={{ color: 'var(--role-moderator-primary)' }}>
              <Shield className="h-5 w-5" />
              Flagged Users ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: 'var(--role-moderator-primary)' }}></div>
                <p style={{ color: 'var(--role-moderator-primary)', opacity: 0.7 }}>Loading users...</p>
              </div>
            )}
            
            {!isLoading && filtered.length === 0 && (
              <div className="text-center py-12" style={{ color: 'var(--role-moderator-primary)', opacity: 0.5 }}>
                <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No users found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            )}
            
            <div className="space-y-4">
              {filtered.map((user) => (
                <div 
                  key={user.id} 
                  className="rounded-lg border-2 p-5 hover:shadow-lg transition-all duration-200"
                  style={{ 
                    borderColor: 'rgba(var(--role-moderator-primary-rgb), 0.2)',
                    backgroundColor: 'rgba(var(--role-moderator-primary-rgb), 0.02)'
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg" style={{ color: 'var(--role-moderator-primary)' }}>
                          {user.name}
                        </h4>
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--role-moderator-primary)', opacity: 0.7 }}>
                        <span>{user.email}</span>
                        <span>•</span>
                        <span>Last active: {new Date(user.lastActive).toLocaleDateString()}</span>
                        {user.flags > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1" style={{ color: 'var(--role-moderator-alert)' }}>
                              <AlertCircle className="h-4 w-4" />
                              {user.flags} flag{user.flags > 1 ? 's' : ''}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {user.status === 'ACTIVE' ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="hover:shadow-md transition-all"
                          style={{ 
                            borderColor: 'rgba(var(--role-moderator-alert-rgb), 0.3)',
                            color: 'var(--role-moderator-alert)'
                          }}
                          onClick={() => setStatus(user.id, 'SUSPENDED')}
                          disabled={processingId === user.id}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Suspend
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="hover:shadow-md transition-all"
                          style={{ 
                            borderColor: 'rgba(var(--role-moderator-success-rgb), 0.3)',
                            color: 'var(--role-moderator-success)'
                          }}
                          onClick={() => setStatus(user.id, 'ACTIVE')}
                          disabled={processingId === user.id}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
