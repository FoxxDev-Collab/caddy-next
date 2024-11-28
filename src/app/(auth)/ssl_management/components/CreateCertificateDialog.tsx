import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Spinner } from '@/app/components/ui/spinner';
import { Switch } from '@/app/components/ui/switch';
import { CaddyHost, SSLCertificate } from '@/lib/caddy/types';
import { Card } from '@/app/components/ui/card';

interface CreateCertificateDialogProps {
  availableHosts: CaddyHost[];
  certificates: SSLCertificate[];
  onCreateCertificate: (domain: string, options: { autoRenew: boolean; forceSSL: boolean }) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCertificateDialog({
  availableHosts,
  certificates,
  onCreateCertificate,
  isOpen,
  onOpenChange,
}: CreateCertificateDialogProps) {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [autoRenew, setAutoRenew] = useState(true);
  const [forceSSL, setForceSSL] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the selected host details
  const selectedHost = availableHosts.find(host => host.domain === selectedDomain);

  const handleCreate = async () => {
    if (!selectedDomain || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await onCreateCertificate(selectedDomain, {
        autoRenew,
        forceSSL,
      });
      // Reset form
      setSelectedDomain('');
      setAutoRenew(true);
      setForceSSL(true);
    } catch (error) {
      console.error('Failed to create certificate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableDomainsForSSL = availableHosts.filter(
    host => !certificates.some(cert => cert.domain === host.domain)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Add Certificate</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create SSL Certificate</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="domain">Domain</Label>
            <Select
              value={selectedDomain}
              onValueChange={setSelectedDomain}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a domain" />
              </SelectTrigger>
              <SelectContent>
                {availableDomainsForSSL.map(host => (
                  <SelectItem key={host.id} value={host.domain}>
                    {host.domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableDomainsForSSL.length === 0 && (
              <p className="text-sm text-yellow-600">
                No domains available for SSL certification. Add a host first or ensure existing hosts don&apos;t already have certificates.
              </p>
            )}
          </div>

          {selectedHost && (
            <Card className="p-4 bg-muted/50">
              <h3 className="font-medium mb-2">Host Details</h3>
              <div className="grid gap-1 text-sm">
                <p>Target: {selectedHost.targetHost}:{selectedHost.targetPort}</p>
                <p>SSL Status: {selectedHost.ssl ? 'Enabled' : 'Disabled'}</p>
                <p>Force SSL: {selectedHost.forceSSL ? 'Yes' : 'No'}</p>
              </div>
            </Card>
          )}

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="grid gap-1.5">
                <Label htmlFor="autoRenew">Auto-Renew Certificate</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically renew the certificate before expiration
                </p>
              </div>
              <Switch
                id="autoRenew"
                checked={autoRenew}
                onCheckedChange={setAutoRenew}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="grid gap-1.5">
                <Label htmlFor="forceSSL">Force SSL</Label>
                <p className="text-sm text-muted-foreground">
                  Redirect all HTTP traffic to HTTPS
                </p>
              </div>
              <Switch
                id="forceSSL"
                checked={forceSSL}
                onCheckedChange={setForceSSL}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleCreate}
            disabled={isSubmitting || !selectedDomain}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
