'use client';

import { Button } from '@/app/components/ui/button';
import { useSSL } from '@/lib/hooks/useSSL';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { SSLCertsTable } from './components/SSLCertsTable';
import { Card } from '@/app/components/ui/card';
import { Spinner } from '@/app/components/ui/spinner';

export default function SSLManagementPage() {
  const { certificates, loading, error, createCertificate, deleteCertificate, refresh } = useSSL();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!newDomain || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await createCertificate(newDomain);
      setNewDomain('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create certificate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading SSL Certificates</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button 
            onClick={refresh}
            variant="outline"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">SSL Certificates</h1>
          {loading && <Spinner className="w-4 h-4" />}
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={loading}>Add Certificate</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create SSL Certificate</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="example.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <Button 
              onClick={handleCreate} 
              disabled={isSubmitting || !newDomain.trim()}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Creating...
                </>
              ) : (
                'Create Certificate'
              )}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <SSLCertsTable 
        certificates={certificates}
        onDelete={deleteCertificate}
        isLoading={loading}
      />
    </div>
  );
}
