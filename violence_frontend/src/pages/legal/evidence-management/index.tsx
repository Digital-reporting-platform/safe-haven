import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { legalWorkflowService } from '@/services/legalWorkflowService';

const EvidenceManagement = () => {
  const [items, setItems] = useState<
    Array<{
      id: string;
      reportId: string;
      caseTitle: string;
      name: string;
      fileType: string;
      url: string;
      uploadedAt: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await legalWorkflowService.getEvidence();
        setItems(data);
      } catch (error: any) {
        console.error('Failed to load evidence', error);
        toast.error(error?.message || 'Failed to load evidence');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Evidence Management</h1>
        <p className="text-muted-foreground">Evidence files from legal-assigned survivor reports.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Evidence Library</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <div className="text-muted-foreground text-sm">Loading evidence...</div>}
          {!isLoading && items.length === 0 && (
            <div className="text-muted-foreground text-sm">No evidence found for assigned legal cases.</div>
          )}
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{item.name}</h4>
                <span className="text-xs">{item.fileType}</span>
              </div>
              <p className="text-muted-foreground text-sm">{item.caseTitle}</p>
              <p className="text-muted-foreground text-xs">
                Uploaded {new Date(item.uploadedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default EvidenceManagement;
