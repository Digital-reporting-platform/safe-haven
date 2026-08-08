import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  FileText,
  Download,
  Eye,
  Plus,
  Search,
  Filter,
} from 'lucide-react';
import { useState } from 'react';

const Documentation = () => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Mock documents data
  const documents = [
    {
      id: 'D001',
      title: 'Forensic Report - Sexual Assault Exam',
      patientName: 'Sarah Johnson',
      patientId: 'P001',
      type: 'Forensic Report',
      dateCreated: '2024-02-20',
      lastModified: '2024-02-20',
      size: '2.3 MB',
      status: 'Final',
      category: 'Medical Legal',
      tags: ['forensic', 'sexual assault', 'evidence'],
    },
    {
      id: 'D002',
      title: 'Chain of Custody - Evidence Collection',
      patientName: 'Sarah Johnson',
      patientId: 'P001',
      type: 'Chain of Custody',
      dateCreated: '2024-02-20',
      lastModified: '2024-02-20',
      size: '1.8 MB',
      status: 'Final',
      category: 'Legal',
      tags: ['chain of custody', 'evidence', 'legal'],
    },
    {
      id: 'D003',
      title: 'Medical Examination Report',
      patientName: 'Michael Chen',
      patientId: 'P002',
      type: 'Medical Report',
      dateCreated: '2024-02-15',
      lastModified: '2024-02-16',
      size: '1.5 MB',
      status: 'Draft',
      category: 'Medical',
      tags: ['examination', 'cardiac', 'report'],
    },
    {
      id: 'D004',
      title: 'Treatment Plan - Asthma Management',
      patientName: 'Sarah Johnson',
      patientId: 'P001',
      type: 'Treatment Plan',
      dateCreated: '2024-01-15',
      lastModified: '2024-02-20',
      size: '890 KB',
      status: 'Final',
      category: 'Treatment',
      tags: ['treatment plan', 'asthma', 'management'],
    },
    {
      id: 'D005',
      title: 'Photographic Evidence Documentation',
      patientName: 'Emma Davis',
      patientId: 'P003',
      type: 'Evidence Photos',
      dateCreated: '2024-01-20',
      lastModified: '2024-01-20',
      size: '15.2 MB',
      status: 'Final',
      category: 'Evidence',
      tags: ['photographs', 'evidence', 'documentation'],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Final':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Forensic Report':
      case 'Medical Report':
        return <FileText className="h-4 w-4" />;
      case 'Chain of Custody':
        return <FileText className="h-4 w-4" />;
      case 'Treatment Plan':
        return <FileText className="h-4 w-4" />;
      case 'Evidence Photos':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Documentation</h1>
            <p className="text-muted-foreground">
              Manage forensic reports, chain of custody, and medical legal
              documents.
            </p>
          </div>
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="doc-title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="doc-title"
                    placeholder="Document title"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="patient-select" className="text-right">
                    Patient
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p001">Sarah Johnson (P001)</SelectItem>
                      <SelectItem value="p002">Michael Chen (P002)</SelectItem>
                      <SelectItem value="p003">Emma Davis (P003)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="doc-type" className="text-right">
                    Type
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="forensic">Forensic Report</SelectItem>
                      <SelectItem value="medical">Medical Report</SelectItem>
                      <SelectItem value="evidence">Evidence</SelectItem>
                      <SelectItem value="treatment">Treatment Plan</SelectItem>
                      <SelectItem value="legal">Legal Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="file-upload" className="text-right">
                    File
                  </Label>
                  <Input id="file-upload" type="file" className="col-span-3" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsUploadDialogOpen(false)}>
                  Upload
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search documents by title or patient..."
              className="pl-10"
            />
          </div>
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="forensic">Forensic Reports</SelectItem>
            <SelectItem value="medical">Medical Reports</SelectItem>
            <SelectItem value="evidence">Evidence</SelectItem>
            <SelectItem value="treatment">Treatment Plans</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="final">Final</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
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
              Total Documents
            </CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-muted-foreground text-xs">All documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Forensic Reports
            </CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                documents.filter((doc) => doc.category === 'Medical Legal')
                  .length
              }
            </div>
            <p className="text-muted-foreground text-xs">Legal documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Evidence Files
            </CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter((doc) => doc.category === 'Evidence').length}
            </div>
            <p className="text-muted-foreground text-xs">Evidence documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Draft Documents
            </CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter((doc) => doc.status === 'Draft').length}
            </div>
            <p className="text-muted-foreground text-xs">Need completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(doc.type)}
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-muted-foreground text-sm">
                          {doc.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{doc.patientName}</p>
                      <p className="text-muted-foreground text-sm">
                        {doc.patientId}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>
                    <div>
                      <p>{doc.dateCreated}</p>
                      <p className="text-muted-foreground text-sm">
                        Modified: {doc.lastModified}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
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

export default Documentation;
