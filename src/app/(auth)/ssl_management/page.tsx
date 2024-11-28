'use client';

import { Button } from '@/app/components/ui/button';
import { useSSL } from '@/lib/hooks/useSSL';
import { useState } from 'react';
import { SSLCertsTable } from './components/SSLCertsTable';
import { Card } from '@/app/components/ui/card';
import { Spinner } from '@/app/components/ui/spinner';
import { CreateCertificateDialog } from './components/CreateCertificateDialog';

export default function SSLManagementPage() {
  const { 
    certificates, 
    availableHosts, 
    loading, 
    error, 
    createCertificate, 
    deleteCertificate, 
    refreshCertificate, 
    refresh 
  } = useSSL();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateCertificate = async (
    domain: string, 
    options: { autoRenew: boolean; forceSSL: boolean }
  ) => {
    await createCertificate(domain, options);
    setIsCreateDialogOpen(false);
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
        <CreateCertificateDialog
          availableHosts={availableHosts}
          certificates={certificates}
          onCreateCertificate={handleCreateCertificate}
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>

      <SSLCertsTable 
        certificates={certificates}
        onDelete={deleteCertificate}
        onRefresh={refreshCertificate}
        isLoading={loading}
      />
    </div>
  );
}
