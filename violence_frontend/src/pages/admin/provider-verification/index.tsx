import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  CheckCircle,
  Clock,
  Users,
  FileText,
  Shield,
  RefreshCw,
  ArrowRight,
  Award,
} from 'lucide-react';
import {
  providerVerificationService,
  type ProviderStats,
} from '@/services/providerVerificationService';

export function ProviderVerificationPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await providerVerificationService.getProviderStats();
      setStats(data);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to load provider statistics';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Total Providers',
      value: stats?.total ?? 0,
      icon: Users,
      color: 'text-[#6B705C]',
      borderColor: 'border-l-[#6B705C]',
      bgColor: 'bg-[#F5F4F0]',
      iconBg: 'bg-[#E8E7E0]',
    },
    {
      title: 'Verified Providers',
      value: stats?.verified ?? 0,
      icon: CheckCircle,
      color: 'text-[#5D624F]',
      borderColor: 'border-l-[#5D624F]',
      bgColor: 'bg-[#F5F4F0]',
      iconBg: 'bg-[#E8E7E0]',
    },
    {
      title: 'Pending Verification',
      value: stats?.unverified ?? 0,
      icon: Clock,
      color: 'text-[#AD7D4A]',
      borderColor: 'border-l-[#DDA15E]',
      bgColor: 'bg-[#FEFAF5]',
      iconBg: 'bg-[#F7E8D1]',
    },
    {
      title: 'Provider Types',
      value: stats?.byType?.length ?? 0,
      icon: Shield,
      color: 'text-[#C15B3E]',
      borderColor: 'border-l-[#C15B3E]',
      bgColor: 'bg-[#FEF5F2]',
      iconBg: 'bg-[#F8D4C7]',
    },
  ];

  const sections = [
    {
      title: 'Pending Providers',
      description: 'Review and verify new provider applications awaiting approval',
      count: stats?.unverified ?? 0,
      path: 'pending-providers',
      icon: Clock,
      color: 'text-[#AD7D4A]',
      borderColor: 'border-l-[#DDA15E]',
      bgColor: 'bg-[#FEFAF5]',
    },
    {
      title: 'Verified Providers',
      description: 'Manage active and verified service providers on the platform',
      count: stats?.verified ?? 0,
      path: 'verified-providers',
      icon: CheckCircle,
      color: 'text-[#5D624F]',
      borderColor: 'border-l-[#5D624F]',
      bgColor: 'bg-[#F5F4F0]',
    },
    {
      title: 'Verification Process',
      description: 'Configure verification requirements and approval workflows',
      count: null,
      path: 'verification-process',
      icon: Shield,
      color: 'text-[#6B705C]',
      borderColor: 'border-l-[#6B705C]',
      bgColor: 'bg-[#F5F4F0]',
    },
  ];

  return (
    <div className="mx-6 px-4 py-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#AD7D4A]"
               style={{ boxShadow: '0 10px 25px -5px rgba(173, 125, 74, 0.35)' }}>
            <Award className="h-6 w-6 text-[#FDFDF5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#4A4D42]">Provider Verification</h1>
            <p className="text-[#6B705C] mt-1 text-sm">
              Manage and verify service providers across the platform
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={loadStats}
          disabled={isLoading}
          className="h-9 border-[#DAD8CE] bg-white px-3 text-sm font-medium text-[#4A4D42] shadow-sm hover:bg-[#F5F4F0] hover:text-[#3D4035]"
        >
          <RefreshCw className={`mr-1.5 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#4A4D42]">Provider Overview</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Card key={index} className={`overflow-hidden border-l-4 ${stat.borderColor} shadow-sm`}>
              <CardContent className={`${stat.bgColor} pt-5`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[#6B705C]">{stat.title}</p>
                    <h2 className="mt-1 text-2xl font-bold text-[#4A4D42]">{isLoading ? '-' : stat.value}</h2>
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

      {/* Provider Types Breakdown */}
      {stats?.byType && stats.byType.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#4A4D42]">Provider Distribution</h2>
          <Card className="overflow-hidden border-[#DAD8CE] shadow-sm">
            <CardHeader className="border-b border-[#E8E7E0] bg-[#F5F4F0] py-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#4A4D42]">
                <div className="rounded-lg bg-[#F7F3E6] p-1.5">
                  <Shield className="h-4 w-4 text-[#6B705C]" />
                </div>
                Providers by Type
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                {stats.byType.map((typeStat) => (
                  <Badge
                    key={typeStat.type}
                    variant="secondary"
                    className="bg-[#F5F4F0] text-[#4A4D42] border border-[#DAD8CE] text-sm px-3 py-1"
                  >
                    <span className="font-medium">{typeStat.type.replace(/_/g, ' ')}:</span>
                    <span className="ml-1 text-[#6B705C]">{typeStat._count}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Verification Sections */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#4A4D42]">Verification Sections</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, index) => (
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
                        {section.count !== null && (
                          <Badge
                            variant="secondary"
                            className="bg-white/80 text-[#6B705C] border border-[#DAD8CE] text-xs"
                          >
                            {isLoading ? '-' : section.count}
                          </Badge>
                        )}
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

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#4A4D42]">Quick Actions</h2>
        <Card className="overflow-hidden border-[#DAD8CE] shadow-sm">
          <CardHeader className="border-b border-[#E8E7E0] bg-[#F5F4F0] py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#4A4D42]">
              <div className="rounded-lg bg-[#F7F3E6] p-1.5">
                <FileText className="h-4 w-4 text-[#6B705C]" />
              </div>
              Common Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-[#E8E7E0] bg-[#F5F4F0] p-4 transition-shadow hover:shadow-sm cursor-pointer"
                   onClick={() => navigate('pending-providers')}>
                <div className="rounded-full bg-[#E8E7E0] w-10 h-10 flex items-center justify-center mb-3">
                  <CheckCircle className="h-5 w-5 text-[#5D624F]" />
                </div>
                <p className="font-medium text-[#4A4D42] text-sm">Verify Providers</p>
                <p className="text-[#6B705C] text-xs mt-1">
                  Review and approve pending applications
                </p>
              </div>
              <div className="rounded-lg border border-[#E8E7E0] bg-[#F5F4F0] p-4 transition-shadow hover:shadow-sm cursor-pointer"
                   onClick={() => navigate('verified-providers')}>
                <div className="rounded-full bg-[#E8E7E0] w-10 h-10 flex items-center justify-center mb-3">
                  <Users className="h-5 w-5 text-[#6B705C]" />
                </div>
                <p className="font-medium text-[#4A4D42] text-sm">Manage Providers</p>
                <p className="text-[#6B705C] text-xs mt-1">
                  Update provider information and status
                </p>
              </div>
              <div className="rounded-lg border border-[#E8E7E0] bg-[#F5F4F0] p-4 transition-shadow hover:shadow-sm cursor-pointer"
                   onClick={() => navigate('verification-process')}>
                <div className="rounded-full bg-[#E8E7E0] w-10 h-10 flex items-center justify-center mb-3">
                  <Shield className="h-5 w-5 text-[#AD7D4A]" />
                </div>
                <p className="font-medium text-[#4A4D42] text-sm">Configure Process</p>
                <p className="text-[#6B705C] text-xs mt-1">
                  Set verification requirements and workflows
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
