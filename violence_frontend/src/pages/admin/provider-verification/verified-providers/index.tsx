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
import { CheckCircle2, Pencil, RefreshCw, Search, Star } from 'lucide-react';
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

export function VerifiedProvidersPage() {
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
      const response = await providerVerificationService.getVerifiedProviders({
        search: search.trim() || undefined,
        type: typeFilter,
      });
      setProviders(response.data || []);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to load verified providers';
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
          <h1 className="text-3xl font-bold">Verified Providers</h1>
          <p className="text-muted-foreground mt-2">
            Manage active and verified service providers on the platform.
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
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Verified Providers
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
                <TableHead>Rating</TableHead>
                <TableHead>Specializations</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProviders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                    {isLoading ? 'Loading verified providers...' : 'No verified providers found.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{provider.name}</div>
                        <Badge variant="default" className="h-5 px-1.5 text-xs">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      </div>
                      <div className="text-muted-foreground text-xs">{provider.email || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{formatType(provider.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      {[provider.city, provider.country].filter(Boolean).join(', ') || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{provider.rating?.toFixed(1) ?? 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="line-clamp-2 text-sm">
                        {(provider.specializations || []).join(', ') || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openEdit(provider)}>
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
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
            <DialogTitle>Edit Verified Provider</DialogTitle>
            <DialogDescription>
              Update provider details and information.
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
