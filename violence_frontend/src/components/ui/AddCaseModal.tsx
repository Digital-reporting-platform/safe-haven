import { useEffect, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ReportOption = {
  id: string;
  label: string;
};

interface AddCaseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reports: ReportOption[];
  isSubmitting: boolean;
  onSubmit: (reportId: string) => Promise<void> | void;
}

export function AddCaseModal({
  isOpen,
  onOpenChange,
  reports,
  isSubmitting,
  onSubmit,
}: AddCaseModalProps) {
  const [reportId, setReportId] = useState('');

  useEffect(() => {
    if (!isOpen) setReportId('');
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = reportId.trim();
    if (!value) return;
    await onSubmit(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onOpenChange(open)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Case
          </DialogTitle>
          <DialogDescription>
            Select a report to auto-route into case management.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Choose Recent Report</Label>
            <Select value={reportId} onValueChange={setReportId}>
              <SelectTrigger>
                <SelectValue placeholder="Select report" />
              </SelectTrigger>
              <SelectContent>
                {reports.length === 0 && (
                  <SelectItem value="__empty" disabled>
                    No reports available
                  </SelectItem>
                )}
                {reports.map((report) => (
                  <SelectItem key={report.id} value={report.id}>
                    {report.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-id">Or Enter Report ID</Label>
            <Input
              id="report-id"
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
              placeholder="e.g. cmnemjolb0002sxecxt77py0g"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !reportId.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Case'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
