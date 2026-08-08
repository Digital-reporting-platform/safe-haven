import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Download,
  ExternalLink,
  Book,
  Database,
  FileText,
} from 'lucide-react';

const Resources = () => {
  // Mock resources data
  const resources = [
    {
      id: 'R001',
      title: 'Sexual Assault Forensic Examination Protocol',
      category: 'Protocols',
      type: 'Clinical Guideline',
      description:
        'Comprehensive protocol for forensic medical examination of sexual assault victims.',
      lastUpdated: '2024-01-15',
      version: '2.1',
      author: 'Medical Advisory Board',
      tags: ['sexual assault', 'forensic', 'protocol'],
    },
    {
      id: 'R002',
      title: 'Domestic Violence Medical Assessment Guidelines',
      category: 'Guidelines',
      type: 'Clinical Guideline',
      description:
        'Evidence-based guidelines for assessing and documenting domestic violence injuries.',
      lastUpdated: '2024-02-01',
      version: '1.8',
      author: 'Trauma Care Committee',
      tags: ['domestic violence', 'assessment', 'guidelines'],
    },
    {
      id: 'R003',
      title: 'Medication Database - Controlled Substances',
      category: 'Databases',
      type: 'Reference Database',
      description:
        'Comprehensive database of controlled substances and their medical applications.',
      lastUpdated: '2024-02-10',
      version: '2024.1',
      author: 'Pharmacy Department',
      tags: ['medication', 'controlled substances', 'database'],
    },
    {
      id: 'R004',
      title: 'Chain of Custody Documentation Form',
      category: 'Forms',
      type: 'Medical Form',
      description:
        'Standardized form for documenting chain of custody in forensic evidence collection.',
      lastUpdated: '2024-01-20',
      version: '3.0',
      author: 'Forensic Services',
      tags: ['chain of custody', 'evidence', 'form'],
    },
    {
      id: 'R005',
      title: 'Mental Health Crisis Intervention Protocol',
      category: 'Protocols',
      type: 'Emergency Protocol',
      description:
        'Protocol for responding to mental health crises in medical settings.',
      lastUpdated: '2023-12-15',
      version: '2.3',
      author: 'Psychiatry Department',
      tags: ['mental health', 'crisis', 'protocol'],
    },
    {
      id: 'R006',
      title: 'Injury Documentation Guidelines',
      category: 'Guidelines',
      type: 'Documentation Guideline',
      description:
        'Guidelines for photographing and documenting injuries in forensic cases.',
      lastUpdated: '2024-01-08',
      version: '1.5',
      author: 'Forensic Photography Team',
      tags: ['injury', 'documentation', 'photography'],
    },
    {
      id: 'R007',
      title: 'Emergency Contraception Reference Guide',
      category: 'Databases',
      type: 'Reference Guide',
      description:
        'Quick reference guide for emergency contraception options and protocols.',
      lastUpdated: '2024-02-05',
      version: '4.2',
      author: "Women's Health Services",
      tags: ['emergency contraception', 'reference', 'guide'],
    },
    {
      id: 'R008',
      title: 'Patient Consent Form - Forensic Examination',
      category: 'Forms',
      type: 'Consent Form',
      description: 'Standard consent form for forensic medical examinations.',
      lastUpdated: '2023-11-30',
      version: '2.1',
      author: 'Legal Department',
      tags: ['consent', 'forensic', 'form'],
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Protocols':
        return <Book className="h-4 w-4" />;
      case 'Guidelines':
        return <FileText className="h-4 w-4" />;
      case 'Databases':
        return <Database className="h-4 w-4" />;
      case 'Forms':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Protocols':
        return 'bg-blue-100 text-blue-800';
      case 'Guidelines':
        return 'bg-green-100 text-green-800';
      case 'Databases':
        return 'bg-purple-100 text-purple-800';
      case 'Forms':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Medical Resources</h1>
        <p className="text-muted-foreground">
          Access protocols, guidelines, medication databases, and medical forms.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search resources by title or keywords..."
              className="pl-10"
            />
          </div>
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="protocols">Protocols</SelectItem>
            <SelectItem value="guidelines">Guidelines</SelectItem>
            <SelectItem value="databases">Databases</SelectItem>
            <SelectItem value="forms">Forms</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="clinical">Clinical Guidelines</SelectItem>
            <SelectItem value="reference">Reference Guides</SelectItem>
            <SelectItem value="forms">Medical Forms</SelectItem>
            <SelectItem value="protocols">Protocols</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Resources
            </CardTitle>
            <Book className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
            <p className="text-muted-foreground text-xs">Available resources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protocols</CardTitle>
            <Book className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.filter((res) => res.category === 'Protocols').length}
            </div>
            <p className="text-muted-foreground text-xs">Clinical protocols</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guidelines</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.filter((res) => res.category === 'Guidelines').length}
            </div>
            <p className="text-muted-foreground text-xs">Practice guidelines</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forms</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.filter((res) => res.category === 'Forms').length}
            </div>
            <p className="text-muted-foreground text-xs">Medical forms</p>
          </CardContent>
        </Card>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <Card key={resource.id} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(resource.category)}
                  <Badge className={getCategoryColor(resource.category)}>
                    {resource.category}
                  </Badge>
                </div>
                <Badge variant="outline">{resource.version}</Badge>
              </div>
              <CardTitle className="text-lg">{resource.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                {resource.description}
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Type:</strong> {resource.type}
                </div>
                <div>
                  <strong>Author:</strong> {resource.author}
                </div>
                <div>
                  <strong>Last Updated:</strong> {resource.lastUpdated}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {resource.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            Previous
          </Button>
          <Button variant="default">1</Button>
          <Button variant="outline">2</Button>
          <Button variant="outline">3</Button>
          <Button variant="outline">Next</Button>
        </div>
      </div>
    </div>
  );
};

export default Resources;
