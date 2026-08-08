import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Filter, Calendar, Clock, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AlertsHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const navigate = useNavigate();

  // Mock historical alerts data (extended with more historical data)
  const historicalAlerts = [
    {
      id: 'ALT001',
      patient: 'Sarah Johnson',
      type: 'Urgent Follow-up',
      priority: 'High',
      status: 'Resolved',
      message: 'Patient requires immediate follow-up for examination results',
      timestamp: '2 hours ago',
      resolvedAt: '1 hour ago',
      resolvedBy: 'Dr. Smith',
      actionTaken: 'Patient contacted and follow-up scheduled',
    },
    {
      id: 'ALT002',
      patient: 'Michael Chen',
      type: 'Medication Reminder',
      priority: 'Medium',
      status: 'Resolved',
      message: 'Prescription refill due in 3 days',
      timestamp: '4 hours ago',
      resolvedAt: '2 hours ago',
      resolvedBy: 'System',
      actionTaken: 'Automated reminder sent',
    },
    {
      id: 'ALT003',
      patient: 'Emma Davis',
      type: 'Appointment Missed',
      priority: 'High',
      status: 'Resolved',
      message: 'Patient missed scheduled appointment yesterday',
      timestamp: '1 day ago',
      resolvedAt: '12 hours ago',
      resolvedBy: 'Dr. Johnson',
      actionTaken: 'Patient rescheduled for next week',
    },
    {
      id: 'ALT004',
      patient: 'David Wilson',
      type: 'Lab Results',
      priority: 'Medium',
      status: 'Resolved',
      message: 'Lab results are ready for review',
      timestamp: '2 days ago',
      resolvedAt: '1 day ago',
      resolvedBy: 'Dr. Smith',
      actionTaken: 'Results reviewed and patient notified',
    },
    {
      id: 'ALT005',
      patient: 'Lisa Brown',
      type: 'Treatment Update',
      priority: 'Low',
      status: 'Active',
      message: 'Weekly treatment progress update available',
      timestamp: '3 days ago',
      resolvedAt: null,
      resolvedBy: null,
      actionTaken: null,
    },
    {
      id: 'ALT006',
      patient: 'James Miller',
      type: 'Medication Adherence',
      priority: 'Medium',
      status: 'Resolved',
      message: 'Patient missed medication doses',
      timestamp: '5 days ago',
      resolvedAt: '4 days ago',
      resolvedBy: 'Nurse Williams',
      actionTaken: 'Patient counseled on adherence',
    },
    {
      id: 'ALT007',
      patient: 'Anna Taylor',
      type: 'Follow-up Required',
      priority: 'High',
      status: 'Resolved',
      message: 'Post-treatment follow-up needed',
      timestamp: '1 week ago',
      resolvedAt: '6 days ago',
      resolvedBy: 'Dr. Brown',
      actionTaken: 'Follow-up appointment completed',
    },
    {
      id: 'ALT008',
      patient: 'Robert Davis',
      type: 'Test Results',
      priority: 'Low',
      status: 'Resolved',
      message: 'Routine test results available',
      timestamp: '2 weeks ago',
      resolvedAt: '2 weeks ago',
      resolvedBy: 'System',
      actionTaken: 'Results automatically filed',
    },
  ];

  const filteredAlerts = historicalAlerts.filter((alert) => {
    const matchesSearch = 
      alert.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.actionTaken && alert.actionTaken.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDateFilter = 
      filterDateRange === 'all' || 
      (filterDateRange === 'week' && alert.timestamp.includes('week')) ||
      (filterDateRange === 'day' && (alert.timestamp.includes('hour') || alert.timestamp.includes('day'))) ||
      (filterDateRange === 'resolved' && alert.status === 'Resolved');
    
    return matchesSearch && matchesDateFilter;
  });

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'medical-badge-high';
      case 'Medium':
        return 'medical-badge-medium';
      case 'Low':
        return 'medical-badge-low';
      default:
        return 'medical-badge-medium';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Resolved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleViewDetails = (alertId: string) => {
    console.log(`Viewing details for alert ${alertId}`);
    // Future: Open detailed alert view modal
  };

  const handleBackToAlerts = () => {
    navigate('/medical-provider/alerts');
  };

  // Calculate statistics
  const totalAlerts = historicalAlerts.length;
  const resolvedAlerts = historicalAlerts.filter(a => a.status === 'Resolved').length;
  const activeAlerts = historicalAlerts.filter(a => a.status === 'Active').length;
  const highPriorityAlerts = historicalAlerts.filter(a => a.priority === 'High').length;

  return (
    <div className="container mx-auto px-4 py-12 medical-theme-bg">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={handleBackToAlerts}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Alerts
          </Button>
          <div>
            <h1 className="mb-2 text-3xl font-bold medical-theme-text">Alerts History</h1>
            <p className="text-muted-foreground">
              View historical alerts and their resolution details.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlerts}</div>
            <p className="text-muted-foreground text-xs">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="text-green-500 h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedAlerts}</div>
            <p className="text-muted-foreground text-xs">
              {Math.round((resolvedAlerts / totalAlerts) * 100)}% completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Still Active</CardTitle>
            <AlertTriangle className="medical-alert-icon h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts}</div>
            <p className="text-muted-foreground text-xs">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="text-red-500 h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityAlerts}</div>
            <p className="text-muted-foreground text-xs">Urgent cases</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search history by patient, type, action, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={filterDateRange}
          onChange={(e) => setFilterDateRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
          aria-label="Filter alerts by date range"
        >
          <option value="all">All Time</option>
          <option value="day">Today & Yesterday</option>
          <option value="week">This Week</option>
          <option value="resolved">Resolved Only</option>
        </select>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts History ({filteredAlerts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alert ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Resolved</TableHead>
                <TableHead>Resolved By</TableHead>
                <TableHead>Action Taken</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.id}</TableCell>
                  <TableCell>{alert.patient}</TableCell>
                  <TableCell>{alert.type}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityBadgeClass(alert.priority)}>
                      {alert.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(alert.status)}
                      <span className="text-sm">{alert.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>{alert.timestamp}</TableCell>
                  <TableCell>{alert.resolvedAt || '-'}</TableCell>
                  <TableCell>{alert.resolvedBy || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate" title={alert.actionTaken || '-'}>
                    {alert.actionTaken || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(alert.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAlerts.length === 0 && (
            <div className="text-muted-foreground py-8 text-center">
              No historical alerts found matching your search criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{resolvedAlerts}</div>
              <p className="text-sm text-muted-foreground">Alerts Successfully Resolved</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((resolvedAlerts / totalAlerts) * 100)}%
              </div>
              <p className="text-sm text-muted-foreground">Resolution Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{activeAlerts}</div>
              <p className="text-sm text-muted-foreground">Still Need Attention</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsHistoryPage;
