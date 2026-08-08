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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Download, Eye, Plus, Search, Filter } from 'lucide-react';

const ExamReports = () => {
  // Mock exam reports data
  const reports = [
    {
      id: 'R001',
      patientName: 'Sarah Johnson',
      patientId: 'P001',
      examType: 'Physical Exam',
      examDate: '2024-02-20',
      reportDate: '2024-02-20',
      status: 'Final',
      priority: 'Normal',
      generatedBy: 'Dr. Sarah Smith',
      summary: 'Routine physical examination shows patient in good health.',
    },
    {
      id: 'R002',
      patientName: 'Michael Chen',
      patientId: 'P002',
      examType: 'Pulmonary Function Test',
      examDate: '2024-02-15',
      reportDate: '2024-02-16',
      status: 'Final',
      priority: 'Urgent',
      generatedBy: 'Respiratory Therapy',
      summary: 'PFT results show significant improvement in lung function.',
    },
    {
      id: 'R003',
      patientName: 'Emma Davis',
      patientId: 'P003',
      examType: 'Chest X-Ray',
      examDate: '2023-12-01',
      reportDate: '2023-12-02',
      status: 'Final',
      priority: 'Normal',
      generatedBy: 'Radiology',
      summary: 'Chest X-ray shows clear lung fields with no abnormalities.',
    },
    {
      id: 'R004',
      patientName: 'David Wilson',
      patientId: 'P004',
      examType: 'Cardiac Stress Test',
      examDate: '2024-02-18',
      reportDate: null,
      status: 'Draft',
      priority: 'High',
      generatedBy: 'Cardiology',
      summary: 'Stress test in progress, results pending.',
    },
    {
      id: 'R005',
      patientName: 'Lisa Brown',
      patientId: 'P005',
      examType: 'Blood Work',
      examDate: '2024-02-19',
      reportDate: '2024-02-19',
      status: 'Final',
      priority: 'Normal',
      generatedBy: 'Lab Services',
      summary: 'Complete blood count within normal ranges.',
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
      case 'Urgent':
        return 'destructive';
      case 'Normal':
        return 'default';
      case 'Low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Examination Reports</h1>
            <p className="text-muted-foreground">
              Generate, view, and manage examination reports.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search reports by patient name or ID..."
              className="pl-10"
            />
          </div>
        </div>
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
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="physical">Physical Exam</SelectItem>
            <SelectItem value="diagnostic">Diagnostic</SelectItem>
            <SelectItem value="lab">Lab Work</SelectItem>
            <SelectItem value="imaging">Imaging</SelectItem>
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
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-muted-foreground text-xs">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Final Reports</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter((report) => report.status === 'Final').length}
            </div>
            <p className="text-muted-foreground text-xs">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Reports</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter((report) => report.status === 'Draft').length}
            </div>
            <p className="text-muted-foreground text-xs">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter((report) => report.status === 'Pending').length}
            </div>
            <p className="text-muted-foreground text-xs">Awaiting results</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Examination Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Exam Type</TableHead>
                <TableHead>Exam Date</TableHead>
                <TableHead>Report Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{report.patientName}</p>
                      <p className="text-muted-foreground text-sm">
                        {report.patientId}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{report.examType}</TableCell>
                  <TableCell>{report.examDate}</TableCell>
                  <TableCell>{report.reportDate || 'Pending'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(report.priority)}>
                      {report.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {report.status === 'Final' && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {report.status === 'Draft' && (
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
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

export default ExamReports;
