import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Star } from 'lucide-react';

const Templates = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2">Document Templates</h1>
        <p className="text-muted-foreground">
          Use pre-built legal document templates to streamline your work.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Protection Order Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Protection Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Standard template for domestic violence protection orders.
            </p>
            <div className="mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">4.8 (24 reviews)</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button size="sm" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Use Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Custody Agreement Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              Custody Agreement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Comprehensive child custody and visitation agreement template.
            </p>
            <div className="mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">4.9 (31 reviews)</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button size="sm" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Use Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Restraining Order Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-500" />
              Restraining Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Template for filing emergency and permanent restraining orders.
            </p>
            <div className="mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">4.7 (18 reviews)</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button size="sm" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Use Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Evidence Affidavit Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Evidence Affidavit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Template for submitting sworn evidence statements.
            </p>
            <div className="mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">4.6 (12 reviews)</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button size="sm" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Use Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settlement Agreement Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              Settlement Agreement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Template for mutual settlement agreements between parties.
            </p>
            <div className="mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">4.8 (27 reviews)</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button size="sm" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Use Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Court Motion Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" />
              Court Motion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Template for filing various types of court motions.
            </p>
            <div className="mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">4.5 (15 reviews)</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button size="sm" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Use Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Template Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Protection Orders</Badge>
            <Badge variant="outline">Custody & Visitation</Badge>
            <Badge variant="outline">Restraining Orders</Badge>
            <Badge variant="outline">Evidence & Affidavits</Badge>
            <Badge variant="outline">Settlement Agreements</Badge>
            <Badge variant="outline">Court Motions</Badge>
            <Badge variant="outline">Appeals</Badge>
            <Badge variant="outline">Divorce & Separation</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Templates;
