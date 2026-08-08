import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Trash2, Upload } from 'lucide-react';

const Attachments = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2">Message Attachments</h1>
        <p className="text-muted-foreground">
          Manage files attached to your messages and communications.
        </p>
      </div>

      {/* Upload New Attachment */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Attachment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-muted-foreground mb-4 text-sm">
              Drag and drop files here, or click to browse
            </p>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
            <p className="text-muted-foreground mt-2 text-xs">
              Supported formats: PDF, DOC, DOCX, JPG, PNG, MP4 (max 10MB)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Attachments List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <h4 className="font-medium">
                    Protection_Order_Application.pdf
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Sent to Jane Doe • Case #2024-001 • 2.3 MB
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Uploaded 2 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">PDF</Badge>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-green-500" />
                <div>
                  <h4 className="font-medium">Witness_Statements.docx</h4>
                  <p className="text-muted-foreground text-sm">
                    Sent to Court Administrator • Case #2024-001 • 1.8 MB
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Uploaded 1 day ago
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">DOCX</Badge>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-purple-500" />
                <div>
                  <h4 className="font-medium">Evidence_Photos.zip</h4>
                  <p className="text-muted-foreground text-sm">
                    Sent to Maria Garcia • Case #2024-002 • 5.2 MB
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Uploaded 3 days ago
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">ZIP</Badge>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-orange-500" />
                <div>
                  <h4 className="font-medium">Court_Hearing_Notice.pdf</h4>
                  <p className="text-muted-foreground text-sm">
                    Received from Court • Case #2024-001 • 0.8 MB
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Uploaded 1 week ago
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">PDF</Badge>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Used Storage</span>
                <span>2.4 GB / 10 GB</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 w-1/4 rounded-full bg-blue-600"></div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Secure, encrypted storage for all message attachments. Files are
              automatically backed up and accessible across all your devices.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attachments;
