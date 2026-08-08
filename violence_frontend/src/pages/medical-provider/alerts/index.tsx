import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Search, Filter, Bell, AlertTriangle, Clock, CheckCircle, XCircle, Plus, Download, History } from 'lucide-react';

const AlertsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  // Mock alerts data
  const alerts = [
    {
      id: 'ALT001',
      patient: 'Sarah Johnson',
      type: 'Urgent Follow-up',
      priority: 'High',
      status: 'Active',
      message: 'Patient requires immediate follow-up for examination results',
      timestamp: '2 hours ago',
      action: 'Contact Patient',
    },
    {
      id: 'ALT002',
      patient: 'Michael Chen',
      type: 'Medication Reminder',
      priority: 'Medium',
      status: 'Active',
      message: 'Prescription refill due in 3 days',
      timestamp: '4 hours ago',
      action: 'Send Reminder',
    },
    {
      id: 'ALT003',
      patient: 'Emma Davis',
      type: 'Appointment Missed',
      priority: 'High',
      status: 'Active',
      message: 'Patient missed scheduled appointment yesterday',
      timestamp: '1 day ago',
      action: 'Reschedule',
    },
    {
      id: 'ALT004',
      patient: 'David Wilson',
      type: 'Lab Results',
      priority: 'Medium',
      status: 'Resolved',
      message: 'Lab results are ready for review',
      timestamp: '2 days ago',
      action: 'Review Results',
    },
    {
      id: 'ALT005',
      patient: 'Lisa Brown',
      type: 'Treatment Update',
      priority: 'Low',
      status: 'Active',
      message: 'Weekly treatment progress update available',
      timestamp: '3 days ago',
      action: 'View Update',
    },
  ];

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = 
      alert.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || 
      alert.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
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
        return <Bell className="h-4 w-4" />;
      case 'Resolved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleAction = (alertId: string, action: string) => {
    console.log(`Alert ${alertId}: ${action}`);
    // Here you would implement the actual action logic
    switch (action) {
      case 'Contact Patient':
        console.log('Opening patient contact modal...');
        // Future: Open contact modal or navigate to patient details
        break;
      case 'Send Reminder':
        console.log('Sending medication reminder...');
        // Future: Send automated reminder
        break;
      case 'Reschedule':
        console.log('Opening reschedule modal...');
        // Future: Open reschedule modal
        break;
      case 'Review Results':
        console.log('Navigating to lab results...');
        // Future: Navigate to lab results page
        break;
      case 'View Update':
        console.log('Opening treatment update...');
        // Future: Open treatment update modal
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  const handleResolve = (alertId: string) => {
    console.log(`Resolving alert ${alertId}`);
    // Here you would implement the resolve logic
    // Future: Update alert status in database
    alert(`Alert ${alertId} marked as resolved!`);
  };

  const handleNewAlert = () => {
    console.log('Creating new alert...');
    // Future: Open new alert modal/form
    alert('New alert feature coming soon!');
  };

  const handleResolveAll = () => {
    console.log('Resolving all active alerts...');
    const activeAlerts = alerts.filter(a => a.status === 'Active');
    if (activeAlerts.length === 0) {
      alert('No active alerts to resolve!');
      return;
    }
    // Future: Update all active alerts status in database
    alert(`Resolved ${activeAlerts.length} active alerts!`);
  };

  const handleExport = () => {
    console.log('Exporting alerts data...');
    // Future: Generate and download CSV/PDF report
    const alertData = alerts.map(alert => ({
      ID: alert.id,
      Patient: alert.patient,
      Type: alert.type,
      Priority: alert.priority,
      Status: alert.status,
      Message: alert.message,
      Timestamp: alert.timestamp
    }));
    
    // Create CSV content
    const csvContent = [
      Object.keys(alertData[0]).join(','),
      ...alertData.map(alert => Object.values(alert).join(','))
    ].join('\n');
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-alerts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('Alerts exported successfully!');
  };

  const handleHistory = () => {
    console.log('Navigating to alerts history...');
    navigate('/medical-provider/alerts/history');
  };

  return (
    <div className="container mx-auto px-4 py-12 medical-theme-bg">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold medical-theme-text">Medical Alerts</h1>
        <p className="text-muted-foreground">
          Manage and respond to important medical notifications and patient alerts.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Bell className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-muted-foreground text-xs">All alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="medical-alert-icon h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.status === 'Active').length}
            </div>
            <p className="text-muted-foreground text-xs">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="text-red-500 h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.priority === 'High').length}
            </div>
            <p className="text-muted-foreground text-xs">Urgent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="text-green-500 h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.status === 'Resolved').length}
            </div>
            <p className="text-muted-foreground text-xs">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search alerts by patient, type, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
          aria-label="Filter alerts by status"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
        </select>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts ({filteredAlerts.length})</CardTitle>
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
                <TableHead>Message</TableHead>
                <TableHead>Time</TableHead>
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
                  <TableCell className="max-w-xs truncate" title={alert.message}>
                    {alert.message}
                  </TableCell>
                  <TableCell>{alert.timestamp}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(alert.id, alert.action)}
                      >
                        {alert.action}
                      </Button>
                      {alert.status === 'Active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolve(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAlerts.length === 0 && (
            <div className="text-muted-foreground py-8 text-center">
              No alerts found matching your search criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Button 
              className="flex h-20 flex-col items-center gap-2 medical-button-primary"
              onClick={handleNewAlert}
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">New Alert</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex h-20 flex-col items-center gap-2"
              onClick={handleResolveAll}
            >
              <CheckCircle className="h-6 w-6" />
              <span className="text-sm">Resolve All</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex h-20 flex-col items-center gap-2"
              onClick={handleExport}
            >
              <Download className="h-6 w-6" />
              <span className="text-sm">Export</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex h-20 flex-col items-center gap-2"
              onClick={handleHistory}
            >
              <History className="h-6 w-6" />
              <span className="text-sm">History</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsPage;
