import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send, Paperclip, Save } from 'lucide-react';

const MessageComposer = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2">Compose Message</h1>
        <p className="text-muted-foreground">
          Send a secure message to clients, colleagues, or court officials.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            New Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recipient */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="recipient">Recipient</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jane-doe">
                    Jane Doe (Client - Case #2024-001)
                  </SelectItem>
                  <SelectItem value="maria-garcia">
                    Maria Garcia (Client - Case #2024-002)
                  </SelectItem>
                  <SelectItem value="john-smith">
                    John Smith (Client - Case #2024-003)
                  </SelectItem>
                  <SelectItem value="court-admin">
                    Court Administrator
                  </SelectItem>
                  <SelectItem value="colleague">Legal Colleague</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Normal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="Message subject" />
          </div>

          {/* Message Body */}
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              rows={8}
            />
          </div>

          {/* Attachments */}
          <div>
            <Label>Attachments</Label>
            <div className="mt-2">
              <Button variant="outline" className="w-full">
                <Paperclip className="mr-2 h-4 w-4" />
                Add Attachments
              </Button>
              <p className="text-muted-foreground mt-1 text-sm">
                Attach documents, evidence, or other files (max 10MB per file)
              </p>
            </div>
          </div>

          {/* Templates */}
          <div>
            <Label>Message Templates</Label>
            <div className="mt-2">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="case-update">
                    Case Status Update
                  </SelectItem>
                  <SelectItem value="hearing-reminder">
                    Hearing Reminder
                  </SelectItem>
                  <SelectItem value="document-request">
                    Document Request
                  </SelectItem>
                  <SelectItem value="consultation-confirm">
                    Consultation Confirmation
                  </SelectItem>
                  <SelectItem value="good-news">
                    Positive Outcome Notification
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Button
              variant="outline"
              className="flex h-auto flex-col items-center gap-2 p-4"
            >
              <Send className="h-6 w-6" />
              <span>Send to All Clients</span>
            </Button>
            <Button
              variant="outline"
              className="flex h-auto flex-col items-center gap-2 p-4"
            >
              <Paperclip className="h-6 w-6" />
              <span>Bulk Message</span>
            </Button>
            <Button
              variant="outline"
              className="flex h-auto flex-col items-center gap-2 p-4"
            >
              <Save className="h-6 w-6" />
              <span>Saved Templates</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Message History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <h4 className="font-medium">
                  Case Update: Protection Order Hearing
                </h4>
                <p className="text-muted-foreground text-sm">
                  Sent to Jane Doe • 2 hours ago
                </p>
              </div>
              <Button size="sm" variant="outline">
                View
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <h4 className="font-medium">Consultation Confirmation</h4>
                <p className="text-muted-foreground text-sm">
                  Sent to Maria Garcia • Yesterday
                </p>
              </div>
              <Button size="sm" variant="outline">
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageComposer;
