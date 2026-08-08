import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, User, Stethoscope, Scale, MessageCircle, Users, Crown } from 'lucide-react';
import { UserRole } from '@/types/user';

const roleDetails: Array<{
  role: UserRole;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  permissions: string[];
}> = [
  {
    role: UserRole.ADMIN,
    label: 'Administrator',
    description: 'Full system access with user management, analytics, and configuration privileges.',
    icon: Crown,
    color: 'text-purple-600',
    permissions: ['Manage Users', 'View Analytics', 'System Settings', 'Provider Verification', 'Security Management'],
  },
  {
    role: UserRole.MODERATOR,
    label: 'Moderator',
    description: 'Content moderation and forum management with limited admin capabilities.',
    icon: Shield,
    color: 'text-orange-600',
    permissions: ['Moderate Forum', 'Review Reports', 'Manage Content', 'View Reports'],
  },
  {
    role: UserRole.MEDICAL_PROFESSIONAL,
    label: 'Medical Professional',
    description: 'Access to medical cases, patient records, and medical support workflows.',
    icon: Stethoscope,
    color: 'text-green-600',
    permissions: ['View Medical Cases', 'Update Patient Records', 'Medical Consultations', 'Access Medical Dashboard'],
  },
  {
    role: UserRole.LEGAL_ADVISOR,
    label: 'Legal Advisor',
    description: 'Access to legal cases, client information, and legal workflow management.',
    icon: Scale,
    color: 'text-red-600',
    permissions: ['View Legal Cases', 'Legal Consultations', 'Case Documentation', 'Access Legal Dashboard'],
  },
  {
    role: UserRole.COUNSELOR,
    label: 'Counselor',
    description: 'Support for survivors with access to counseling cases and resources.',
    icon: MessageCircle,
    color: 'text-teal-600',
    permissions: ['View Counseling Cases', 'Provide Support', 'Access Resources', 'Schedule Sessions'],
  },
  {
    role: UserRole.SURVIVOR,
    label: 'Survivor',
    description: 'Platform users who can submit reports, access resources, and receive support.',
    icon: User,
    color: 'text-blue-600',
    permissions: ['Submit Reports', 'Access Resources', 'View Own Cases', 'Forum Participation', 'Request Support'],
  },
];

export function RolesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Roles</h1>
        <p className="text-muted-foreground mt-2">
          Manage and configure user roles and their associated permissions across the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roleDetails.map((role) => (
          <Card key={role.role} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`rounded-full p-2 bg-gray-100`}>
                  <role.icon className={`h-5 w-5 ${role.color}`} />
                </div>
                <div>
                  <div className="text-lg">{role.label}</div>
                  <Badge variant="secondary" className="text-xs">
                    {role.role}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                {role.description}
              </p>
              <div>
                <p className="text-sm font-medium mb-2">Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Assignment Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Role Assignment Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-purple-100 p-1.5">
                <Crown className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Administrator Role</p>
                <p className="text-muted-foreground">
                  Should be assigned sparingly to trusted personnel only. Admins have full control over the system.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-green-100 p-1.5">
                <Stethoscope className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Professional Roles</p>
                <p className="text-muted-foreground">
                  Medical, Legal, and Counselor roles require verified credentials before assignment.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-1.5">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Survivor Role</p>
                <p className="text-muted-foreground">
                  Default role for all new registrations. Provides access to reporting and support features.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
