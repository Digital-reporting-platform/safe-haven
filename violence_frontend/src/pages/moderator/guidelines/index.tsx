import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Users,
  MessageSquare,
  AlertTriangle,
  FileText,
  Eye,
} from 'lucide-react';

const Guidelines = () => {
  const iconMap = {
    'Community Standards': Users,
    'Content Policies': MessageSquare,
    'Reporting Guidelines': AlertTriangle,
    'Moderation Procedures': Shield,
    'Privacy & Safety': Eye,
    'Legal Compliance': FileText,
  };

  const guidelines = [
    {
      title: 'Community Standards',
      description:
        'Our platform is committed to providing a safe, respectful, and supportive environment for all users. We expect all community members to treat each other with dignity and respect.',
      icon: Users,
      color: 'text-blue-500',
      points: [
        'Respect the privacy and dignity of all users',
        'No harassment, bullying, or discriminatory behavior',
        'Support survivors without judgment',
        'Maintain confidentiality of personal information',
      ],
    },
    {
      title: 'Content Policies',
      description:
        'All content posted on our platform must adhere to our content guidelines to ensure a safe and appropriate environment.',
      icon: MessageSquare,
      color: 'text-green-500',
      points: [
        'No sharing of personal identifiable information',
        'Content must be relevant to support services',
        'No promotional or spam content',
        'Sensitive topics must be handled appropriately',
      ],
    },
    {
      title: 'Reporting Guidelines',
      description:
        'Clear guidelines for moderators on how to handle reports and maintain platform safety.',
      icon: AlertTriangle,
      color: 'text-red-500',
      points: [
        'Review all reports within 24 hours',
        'Prioritize high-severity reports',
        'Document all moderation actions',
        'Follow escalation procedures for serious violations',
      ],
    },
    {
      title: 'Moderation Procedures',
      description:
        'Standard procedures for content moderation and user management.',
      icon: Shield,
      color: 'text-purple-500',
      points: [
        'Use progressive moderation actions',
        'Provide clear warnings before suspensions',
        'Document all moderation decisions',
        'Maintain consistent enforcement',
      ],
    },
    {
      title: 'Privacy & Safety',
      description:
        'Guidelines for protecting user privacy and ensuring platform safety.',
      icon: Eye,
      color: 'text-orange-500',
      points: [
        'Never share user personal information',
        'Use secure communication channels',
        'Report any safety concerns immediately',
        'Follow data protection regulations',
      ],
    },
    {
      title: 'Legal Compliance',
      description:
        'Ensuring all moderation activities comply with relevant laws and regulations.',
      icon: FileText,
      color: 'text-indigo-500',
      points: [
        'Follow local laws regarding online content',
        'Report illegal activities to authorities',
        'Maintain records for legal compliance',
        'Respect user rights and freedoms',
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-20 font-sans moderator-bg">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-2">Moderation Guidelines</h1>
          <p className="text-muted-foreground">
            View and manage moderation guidelines and policies.
          </p>
        </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {guidelines.map((guideline, index) => {
          const Icon = guideline.title === 'Community Standards' ? Users : guideline.title === 'Content Policies' ? MessageSquare : guideline.title === 'Reporting Guidelines' ? AlertTriangle : guideline.title === 'Moderation Procedures' ? Shield : guideline.title === 'Privacy & Safety' ? Eye : FileText;
          return (
            <Card key={index} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className={'h-6 w-6 ' + guideline.color} />
                  <CardTitle className="text-lg">{guideline.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  {guideline.description}
                </p>
                <div className="space-y-2">
                  {guideline.points.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="bg-muted-foreground mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
                      <p className="text-sm">{point}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="secondary">Priority</Badge>
              <p className="text-sm">
                User safety and privacy always take precedence over other
                considerations.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary">Consistency</Badge>
              <p className="text-sm">
                Apply guidelines consistently across all users and content
                types.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary">Documentation</Badge>
              <p className="text-sm">
                Document all moderation actions and decisions for
                accountability.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary">Training</Badge>
              <p className="text-sm">
                Regular training and updates on guidelines are essential for
                effective moderation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  );
};

export default Guidelines;
