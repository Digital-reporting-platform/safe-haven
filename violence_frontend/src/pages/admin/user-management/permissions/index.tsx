import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, FileText, Users, Settings, Lock, AlertTriangle } from 'lucide-react';

const permissionCategories = [
  {
    title: 'User Management',
    icon: Users,
    color: 'text-blue-600',
    permissions: [
      { name: 'View Users', description: 'Access user list and profiles', roles: ['ADMIN', 'MODERATOR'] },
      { name: 'Create Users', description: 'Add new users to the system', roles: ['ADMIN'] },
      { name: 'Edit Users', description: 'Modify user information and roles', roles: ['ADMIN'] },
      { name: 'Delete Users', description: 'Remove users from the system', roles: ['ADMIN'] },
      { name: 'Suspend/Activate', description: 'Change user account status', roles: ['ADMIN', 'MODERATOR'] },
    ],
  },
  {
    title: 'Report Management',
    icon: FileText,
    color: 'text-green-600',
    permissions: [
      { name: 'View Reports', description: 'Access incident reports', roles: ['ADMIN', 'MODERATOR', 'MEDICAL_PROFESSIONAL', 'LEGAL_ADVISOR', 'COUNSELOR'] },
      { name: 'Create Reports', description: 'Submit new incident reports', roles: ['SURVIVOR', 'ADMIN'] },
      { name: 'Assign Cases', description: 'Assign reports to professionals', roles: ['ADMIN', 'MODERATOR'] },
      { name: 'Update Status', description: 'Change report status and priority', roles: ['ADMIN', 'MODERATOR', 'MEDICAL_PROFESSIONAL', 'LEGAL_ADVISOR', 'COUNSELOR'] },
      { name: 'Add Evidence', description: 'Upload supporting documents', roles: ['SURVIVOR', 'ADMIN', 'MEDICAL_PROFESSIONAL', 'LEGAL_ADVISOR'] },
    ],
  },
  {
    title: 'Analytics & Insights',
    icon: Eye,
    color: 'text-purple-600',
    permissions: [
      { name: 'View Dashboard', description: 'Access analytics dashboard', roles: ['ADMIN'] },
      { name: 'Generate Reports', description: 'Create system reports', roles: ['ADMIN'] },
      { name: 'View Statistics', description: 'Access statistical data', roles: ['ADMIN', 'MODERATOR'] },
      { name: 'Export Data', description: 'Download analytics data', roles: ['ADMIN'] },
    ],
  },
  {
    title: 'System Configuration',
    icon: Settings,
    color: 'text-orange-600',
    permissions: [
      { name: 'System Settings', description: 'Configure platform settings', roles: ['ADMIN'] },
      { name: 'Security Settings', description: 'Manage security policies', roles: ['ADMIN'] },
      { name: 'Provider Verification', description: 'Verify service providers', roles: ['ADMIN'] },
      { name: 'Role Management', description: 'Configure role permissions', roles: ['ADMIN'] },
    ],
  },
  {
    title: 'Content Moderation',
    icon: Shield,
    color: 'text-red-600',
    permissions: [
      { name: 'Moderate Forum', description: 'Review and moderate forum posts', roles: ['ADMIN', 'MODERATOR'] },
      { name: 'Remove Content', description: 'Delete inappropriate content', roles: ['ADMIN', 'MODERATOR'] },
      { name: 'Ban Users', description: 'Ban users from forum', roles: ['ADMIN', 'MODERATOR'] },
      { name: 'Review Flags', description: 'Review flagged content', roles: ['ADMIN', 'MODERATOR'] },
    ],
  },
  {
    title: 'Security',
    icon: Lock,
    color: 'text-gray-600',
    permissions: [
      { name: 'View Audit Logs', description: 'Access system audit logs', roles: ['ADMIN'] },
      { name: 'Manage Access', description: 'Control access permissions', roles: ['ADMIN'] },
      { name: 'Security Alerts', description: 'View security notifications', roles: ['ADMIN'] },
    ],
  },
];

export function PermissionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Permissions</h1>
        <p className="text-muted-foreground mt-2">
          Overview of system permissions and their assignment to different user roles.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {permissionCategories.map((category) => (
          <Card key={category.title} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <category.icon className={`h-5 w-5 ${category.color}`} />
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.permissions.map((permission) => (
                  <div key={permission.name} className="border-b pb-2 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{permission.name}</span>
                    </div>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {permission.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {permission.roles.map((role) => (
                        <Badge key={role} variant="outline" className="text-[10px] px-1.5 py-0">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permission Guidelines */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Permission Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium">Role-Based Access Control (RBAC)</p>
              <p className="text-muted-foreground">
                The platform uses RBAC to manage permissions. Each role has a predefined set of permissions
                that determine what actions users can perform.
              </p>
            </div>
            <div>
              <p className="font-medium">Permission Inheritance</p>
              <p className="text-muted-foreground">
                Higher-level roles inherit permissions from lower-level roles. Administrators have all permissions,
                while specialized roles (Medical, Legal, Counselor) have domain-specific permissions.
              </p>
            </div>
            <div>
              <p className="font-medium">Security Best Practices</p>
              <p className="text-muted-foreground">
                Always follow the principle of least privilege - assign only the permissions necessary for a user
                to perform their duties. Regularly audit user permissions and remove unnecessary access.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
