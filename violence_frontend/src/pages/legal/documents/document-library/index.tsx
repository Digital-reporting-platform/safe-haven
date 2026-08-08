import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, Download, Eye, Folder } from 'lucide-react';

const DocumentLibrary = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2">Document Library</h1>
        <p className="text-muted-foreground">
          Access and manage your legal document collection.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input placeholder="Search documents..." className="pl-10" />
          </div>
        </div>
        <Button variant="outline">Filter by Type</Button>
        <Button variant="outline">Sort by Date</Button>
      </div>

      {/* Document Categories */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-blue-500" />
              Protection Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2 text-sm">15 documents</p>
            <Button size="sm" variant="outline" className="w-full">
              Browse
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-green-500" />
              Custody Agreements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2 text-sm">8 documents</p>
            <Button size="sm" variant="outline" className="w-full">
              Browse
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-purple-500" />
              Court Filings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2 text-sm">22 documents</p>
            <Button size="sm" variant="outline" className="w-full">
              Browse
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-orange-500" />
              Evidence Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2 text-sm">12 documents</p>
            <Button size="sm" variant="outline" className="w-full">
              Browse
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <h4 className="font-medium">
                    Emergency Protection Order Template.pdf
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Updated 2 days ago • 1.2 MB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">Template</Badge>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-medium">
                    Child Custody Agreement - Case #2024-002.pdf
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Added yesterday • 2.1 MB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Case File</Badge>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-purple-500" />
                <div>
                  <h4 className="font-medium">
                    Domestic Violence Court Procedures.pdf
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Updated 1 week ago • 3.4 MB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Guide</Badge>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentLibrary;
