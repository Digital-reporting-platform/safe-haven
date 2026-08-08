import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle2, Pencil, RefreshCw, Search } from 'lucide-react';
import {
  providerVerificationService,
  type ProviderRecord,
  type ProviderType,
} from '@/services/providerVerificationService';

const PROVIDER_TYPES: Array<ProviderType> = [
  'COUNSELOR',
  'MEDICAL_PROFESSIONAL',
  'LEGAL_ADVISOR',
  'NGO',
  'GOVERNMENT_AGENCY',
  'COMMUNITY_CENTER',
  'SHELTER',
  'HOTLINE',
];

const formatType = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

type EditForm = {
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  description: string;
  availability: string;
  languages: string;
  specializations: string;
};

export function PendingProvidersPage() {
  const [providers, setProviders] = useState<ProviderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ProviderType | 'all'>('all');
  const [editingProvider, setEditingProvider] = useState<ProviderRecord | null>(
    null,
  );
  const [editForm, setEditForm] = useState<EditForm>({
    name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    description: '',
    availability: '',
    languages: '',
    specializations: '',
  });

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const response = await providerVerificationService.getPendingProviders({
        search: search.trim() || undefined,
        type: typeFilter,
      });
      setProviders(response.data || []);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to load pending providers';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const filteredProviders = useMemo(() => {
    const key = search.trim().toLowerCase();
    return providers.filter((provider) => {
      const typeMatches = typeFilter === 'all' || provider.type === typeFilter;
      if (!key) return typeMatches;

      const target = [
        provider.name,
        provider.email || '',
        provider.city || '',
        provider.country || '',
        provider.description || '',
        provider.type,
      ]
        .join(' ')
        .toLowerCase();

      return typeMatches && target.includes(key);
    });
  }, [providers, search, typeFilter]);

  const openEdit = (provider: ProviderRecord) => {
    setEditingProvider(provider);
    setEditForm({
      name: provider.name || '',
      email: provider.email || '',
      phone: provider.phone || '',
      city: provider.city || '',
      country: provider.country || '',
      description: provider.description || '',
      availability: provider.availability || '',
      languages: (provider.languages || []).join(', '),
      specializations: (provider.specializations || []).join(', '),
    });
  };

  const handleVerify = async (providerId: string) => {
    try {
      await providerVerificationService.verifyProvider(providerId);
      toast.success('Provider verified successfully');
      setProviders((prev) => prev.filter((provider) => provider.id !== providerId));
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to verify provider';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingProvider) return;
    if (!editForm.name.trim()) {
      toast.error('Provider name is required');
      return;
    }

    setIsSaving(true);
    try {
      await providerVerificationService.updateProvider(editingProvider.id, {
        name: editForm.name.trim(),
        email: editForm.email.trim() || undefined,
        phone: editForm.phone.trim() || undefined,
        city: editForm.city.trim() || undefined,
        country: editForm.country.trim() || undefined,
        description: editForm.description.trim() || undefined,
        availability: editForm.availability.trim() || undefined,
        languages: editForm.languages
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        specializations: editForm.specializations
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      });
      toast.success('Provider updated');
      setEditingProvider(null);
      await loadProviders();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update provider';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pending Providers</h1>
          <p className="text-muted-foreground mt-2">
            Review provider applications, update details, and verify onboarding.
          </p>
        </div>
        <Button variant="outline" onClick={loadProviders} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Label htmlFor="providerSearch">Search</Label>
              <div className="relative mt-2">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="providerSearch"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, city, description..."
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Provider Type</Label>
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as ProviderType | 'all')}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {PROVIDER_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Pending Applications
            <Badge variant="secondary">{filteredProviders.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Specializations</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProviders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                    {isLoading ? 'Loading pending providers...' : 'No pending providers found.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-muted-foreground text-xs">{provider.email || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{formatType(provider.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      {[provider.city, provider.country].filter(Boolean).join(', ') || '-'}
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="line-clamp-2 text-sm">
                        {(provider.specializations || []).join(', ') || '-'}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(provider.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(provider)}>
                          <Pencil className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                        <Button size="sm" onClick={() => handleVerify(provider.id)}>
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Verify
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(editingProvider)}
        onOpenChange={(open) => !open && !isSaving && setEditingProvider(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Pending Provider</DialogTitle>
            <DialogDescription>
              Update provider details before verification.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={editForm.email}
                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                value={editForm.city}
                onChange={(e) => setEditForm((prev) => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input
                value={editForm.country}
                onChange={(e) => setEditForm((prev) => ({ ...prev, country: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Availability</Label>
              <Input
                value={editForm.availability}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, availability: e.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label>Languages (comma separated)</Label>
              <Input
                value={editForm.languages}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, languages: e.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label>Specializations (comma separated)</Label>
              <Input
                value={editForm.specializations}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, specializations: e.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Input
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingProvider(null)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

