'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PageLoader } from '@/components/ui/spinner';
import { apiClient } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';
import { ApiKeyType } from '@analytics-engine/shared';
import type { ApiKey } from '@analytics-engine/shared';

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [revokeKey, setRevokeKey] = useState<ApiKey | null>(null);

  // Create form
  const [keyName, setKeyName] = useState('');
  const [keyType, setKeyType] = useState<ApiKeyType>(ApiKeyType.EMBED);
  const [creating, setCreating] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      const res = await apiClient.get<ApiKey[]>('/api-keys');
      setApiKeys(res.data);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await apiClient.post<{ apiKey: ApiKey; rawKey: string }>('/api-keys', {
        name: keyName,
        type: keyType,
      });
      setNewKeyValue(res.data.rawKey);
      setKeyName('');
      fetchKeys();
    } catch {
      // error
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeKey) return;
    try {
      await apiClient.delete(`/api-keys/${revokeKey.id}`);
      setRevokeKey(null);
      fetchKeys();
    } catch {
      // error
    }
  };

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">API Keys</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage API keys for admin access and embed authentication.
          </p>
        </div>
        <Button onClick={() => { setCreateOpen(true); setNewKeyValue(null); }}>
          + New API Key
        </Button>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <Card>
          <CardContent className="p-0">
            {apiKeys.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No API keys created yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Key Prefix</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>
                        <Badge variant={key.type === 'ADMIN' ? 'warning' : 'info'}>
                          {key.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{key.keyPrefix}...</TableCell>
                      <TableCell>
                        {key.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="error">Revoked</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {key.lastUsedAt ? formatDateTime(key.lastUsedAt) : 'Never'}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {formatDateTime(key.createdAt)}
                      </TableCell>
                      <TableCell>
                        {key.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRevokeKey(key)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Revoke
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        {newKeyValue ? (
          <>
            <DialogHeader>
              <DialogTitle>API Key Created</DialogTitle>
              <DialogDescription>
                Copy this key now. It will not be shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="my-4 rounded-md bg-gray-900 p-4">
              <code className="break-all text-xs text-emerald-400">{newKeyValue}</code>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(newKeyValue);
                }}
                variant="outline"
              >
                Copy to Clipboard
              </Button>
              <Button onClick={() => setCreateOpen(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for admin or embed access.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="My API Key"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={keyType} onChange={(e) => setKeyType(e.target.value as ApiKeyType)}>
                  <option value={ApiKeyType.EMBED}>
                    Embed (read-only, dashboard data only)
                  </option>
                  <option value={ApiKeyType.ADMIN}>
                    Admin (full access)
                  </option>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating || !keyName.trim()}>
                {creating ? 'Creating...' : 'Create Key'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </Dialog>

      {/* Revoke dialog */}
      <Dialog open={!!revokeKey} onClose={() => setRevokeKey(null)}>
        <DialogHeader>
          <DialogTitle>Revoke API Key</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500">
          Are you sure you want to revoke &quot;{revokeKey?.name}&quot;? Any services using this
          key will immediately lose access.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRevokeKey(null)}>Cancel</Button>
          <Button variant="destructive" onClick={handleRevoke}>Revoke</Button>
        </DialogFooter>
      </Dialog>
    </AppShell>
  );
}
