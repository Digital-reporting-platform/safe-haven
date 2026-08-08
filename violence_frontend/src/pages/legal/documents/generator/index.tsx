import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Wand2, Download } from 'lucide-react';

const Generator = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2">Document Generator</h1>
        <p className="text-muted-foreground">
          Generate custom legal documents using AI-powered templates.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Document Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Select Document Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="doc-type">Document Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="protection-order">
                    Protection Order
                  </SelectItem>
                  <SelectItem value="custody-agreement">
                    Custody Agreement
                  </SelectItem>
                  <SelectItem value="restraining-order">
                    Restraining Order
                  </SelectItem>
                  <SelectItem value="settlement-agreement">
                    Settlement Agreement
                  </SelectItem>
                  <SelectItem value="court-motion">Court Motion</SelectItem>
                  <SelectItem value="evidence-affidavit">
                    Evidence Affidavit
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="case-number">Case Number (Optional)</Label>
              <Input id="case-number" placeholder="e.g., 2024-001" />
            </div>

            <div>
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="federal">Federal Court</SelectItem>
                  <SelectItem value="state">State Court</SelectItem>
                  <SelectItem value="county">County Court</SelectItem>
                  <SelectItem value="municipal">Municipal Court</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Document Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Document Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="petitioner">Petitioner Name</Label>
              <Input id="petitioner" placeholder="Full legal name" />
            </div>

            <div>
              <Label htmlFor="respondent">Respondent Name</Label>
              <Input id="respondent" placeholder="Full legal name" />
            </div>

            <div>
              <Label htmlFor="details">Case Details</Label>
              <Textarea
                id="details"
                placeholder="Describe the situation, relevant facts, and requested relief..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="expedited">Expedited</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Button */}
      <div className="mt-6 flex justify-center">
        <Button size="lg" className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Generate Document
        </Button>
      </div>

      {/* Generated Document Preview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Generated Document Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] rounded-lg border bg-gray-50 p-6">
            <p className="text-muted-foreground text-center">
              Your generated document will appear here once created.
            </p>
            <p className="text-muted-foreground mt-2 text-center text-sm">
              The AI will populate the selected template with your provided
              details and ensure legal accuracy.
            </p>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline">Edit Document</Button>
            <Button>Save to Case</Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Generations */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Generations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <h4 className="font-medium">
                  Protection Order - Case #2024-001
                </h4>
                <p className="text-muted-foreground text-sm">
                  Generated 2 hours ago
                </p>
              </div>
              <Button size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <h4 className="font-medium">
                  Custody Agreement - Case #2024-002
                </h4>
                <p className="text-muted-foreground text-sm">
                  Generated yesterday
                </p>
              </div>
              <Button size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Generator;
