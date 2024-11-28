'use client';

import { SSLCertificate } from '@/lib/caddy/types';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/app/components/ui/alert-dialog';
import { Spinner } from '@/app/components/ui/spinner';
import { useState } from 'react';

interface SSLCertsTableProps {
  certificates: SSLCertificate[];
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function SSLCertsTable({ certificates, onDelete, isLoading = false }: SSLCertsTableProps) {
  const [certificateToDelete, setCertificateToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!certificateToDelete || isDeleting) return;
    
    try {
      setIsDeleting(true);
      await onDelete(certificateToDelete);
      setCertificateToDelete(null);
    } catch (error) {
      console.error('Failed to delete certificate:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {certificates.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          No SSL certificates found. Click &quot;Add Certificate&quot; to create one.
        </Card>
      ) : (
        certificates.map((cert) => (
          <Card key={cert.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{cert.domain}</h2>
                <p className="text-sm text-gray-500">Issuer: {cert.issuer}</p>
                <p className="text-sm text-gray-500">
                  Valid from: {new Date(cert.validFrom).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Valid to: {new Date(cert.validTo).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Auto-renew: {cert.autoRenew ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <AlertDialog open={certificateToDelete === cert.id}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => setCertificateToDelete(cert.id)}
                  >
                    {isDeleting && certificateToDelete === cert.id ? (
                      <Spinner className="w-4 h-4 mr-2" />
                    ) : null}
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Certificate</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the SSL certificate for {cert.domain}?
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel 
                      onClick={() => setCertificateToDelete(null)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete} 
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Spinner className="w-4 h-4 mr-2" />
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
