import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mail, Search, Filter, Reply } from 'lucide-react';

const Inbox = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2">Inbox</h1>
        <p className="text-muted-foreground">
          View and manage your received messages.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input placeholder="Search messages..." className="pl-10" />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline">Mark All Read</Button>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <span className="text-sm font-medium text-blue-600">JD</span>
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <h4 className="font-medium">Jane Doe</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">New</Badge>
                    <span className="text-muted-foreground text-sm">
                      2 hours ago
                    </span>
                  </div>
                </div>
                <h5 className="mb-1 text-sm font-medium">
                  Case Update: Protection Order Hearing
                </h5>
                <p className="text-muted-foreground text-sm">
                  Hi Sarah, I wanted to update you on the status of my
                  protection order case. The hearing is scheduled for next
                  week...
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline">
                    <Reply className="mr-2 h-4 w-4" />
                    Reply
                  </Button>
                  <Button size="sm" variant="outline">
                    View Thread
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <span className="text-sm font-medium text-green-600">MG</span>
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <h4 className="font-medium">Maria Garcia</h4>
                  <span className="text-muted-foreground text-sm">
                    1 day ago
                  </span>
                </div>
                <h5 className="mb-1 text-sm font-medium">
                  Thank you for your help
                </h5>
                <p className="text-muted-foreground text-sm">
                  I wanted to thank you for all your assistance with my
                  restraining order case. The court granted the order
                  yesterday...
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline">
                    <Reply className="mr-2 h-4 w-4" />
                    Reply
                  </Button>
                  <Button size="sm" variant="outline">
                    View Thread
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <span className="text-sm font-medium text-purple-600">JS</span>
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <h4 className="font-medium">John Smith</h4>
                  <span className="text-muted-foreground text-sm">
                    2 days ago
                  </span>
                </div>
                <h5 className="mb-1 text-sm font-medium">
                  Custody Agreement Questions
                </h5>
                <p className="text-muted-foreground text-sm">
                  Regarding the custody agreement we discussed last week, I have
                  a few questions about the visitation schedule...
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline">
                    <Reply className="mr-2 h-4 w-4" />
                    Reply
                  </Button>
                  <Button size="sm" variant="outline">
                    View Thread
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <span className="text-sm font-medium text-orange-600">CT</span>
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <h4 className="font-medium">Court Administrator</h4>
                  <span className="text-muted-foreground text-sm">
                    3 days ago
                  </span>
                </div>
                <h5 className="mb-1 text-sm font-medium">
                  Hearing Notice: Case #2024-001
                </h5>
                <p className="text-muted-foreground text-sm">
                  This is an official notice that the hearing for Case #2024-001
                  has been scheduled for February 25, 2024...
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline">
                    <Reply className="mr-2 h-4 w-4" />
                    Reply
                  </Button>
                  <Button size="sm" variant="outline">
                    View Thread
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
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

export default Inbox;
