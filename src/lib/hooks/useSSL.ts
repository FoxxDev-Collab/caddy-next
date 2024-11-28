import { useCallback, useEffect, useState, useRef } from 'react';
import { SSLCertificate, CaddyHost } from '@/lib/caddy/types';
import { useApi } from './useApi';
import { useToast } from '@/app/components/ui/use-toast';

interface CreateCertificateOptions {
  autoRenew: boolean;
  forceSSL: boolean;
}

export function useSSL() {
  const [certificates, setCertificates] = useState<SSLCertificate[]>([]);
  const [availableHosts, setAvailableHosts] = useState<CaddyHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const api = useApi();
  
  // Use refs to maintain stable references
  const apiRef = useRef(api);
  const toastRef = useRef(toast);
  
  // Update refs when dependencies change
  useEffect(() => {
    apiRef.current = api;
    toastRef.current = toast;
  }, [api, toast]);

  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRef.current.get<SSLCertificate[]>('/api/ssl', {
        showSuccessToast: false
      });
      
      if (Array.isArray(data)) {
        setCertificates(data);
        setError(null);
      } else {
        setCertificates([]);
        setError(new Error('Invalid response format'));
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      toastRef.current({
        title: 'Error',
        description: 'Failed to fetch SSL certificates.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed as we use refs

  const fetchAvailableHosts = useCallback(async () => {
    try {
      const data = await apiRef.current.get<CaddyHost[]>('/api/hosts', {
        showSuccessToast: false
      });
      
      if (Array.isArray(data)) {
        setAvailableHosts(data.filter(host => host.enabled));
        setError(null);
      } else {
        setAvailableHosts([]);
        setError(new Error('Invalid response format'));
      }
    } catch (error) {
      console.error('Error fetching hosts:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, []);

  const createCertificate = useCallback(async (domain: string, options: CreateCertificateOptions) => {
    try {
      const newCert = await apiRef.current.post<SSLCertificate>('/api/ssl', {
        domain,
        autoRenew: options.autoRenew,
        forceSSL: options.forceSSL
      }, {
        showSuccessToast: true,
        successMessage: 'SSL certificate created successfully'
      });
      
      if (newCert && newCert.id && newCert.domain) {
        setCertificates(prev => [...prev, newCert]);
        // Update the host's SSL settings
        setAvailableHosts(prev => prev.map(host => 
          host.domain === domain 
            ? { ...host, ssl: true, forceSSL: options.forceSSL }
            : host
        ));
        setError(null);
        return newCert;
      }
      throw new Error('Invalid certificate data received');
    } catch (error) {
      console.error('Error creating certificate:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    }
  }, []);

  const refreshCertificate = useCallback(async (domain: string) => {
    try {
      const updatedCert = await apiRef.current.post<SSLCertificate>('/api/ssl', { 
        domain,
        action: 'refresh'
      }, {
        showSuccessToast: true,
        successMessage: 'SSL certificate refreshed successfully'
      });
      
      if (updatedCert && updatedCert.id && updatedCert.domain) {
        setCertificates(prev => prev.map(cert => 
          cert.domain === domain ? updatedCert : cert
        ));
        setError(null);
        return updatedCert;
      }
      throw new Error('Invalid certificate data received');
    } catch (error) {
      console.error('Error refreshing certificate:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    }
  }, []);

  const deleteCertificate = useCallback(async (id: string) => {
    try {
      const result = await apiRef.current.delete<{ success: boolean }>(`/api/ssl?id=${id}`, {
        showSuccessToast: true,
        successMessage: 'SSL certificate deleted successfully'
      });
      
      if (result?.success) {
        // Find the certificate to get its domain before removing it
        const certToDelete = certificates.find(cert => cert.id === id);
        setCertificates(prev => prev.filter(cert => cert.id !== id));
        
        // Update the host's SSL settings if we found the certificate
        if (certToDelete) {
          setAvailableHosts(prev => prev.map(host => 
            host.domain === certToDelete.domain 
              ? { ...host, ssl: false, forceSSL: false }
              : host
          ));
        }
        
        setError(null);
      } else {
        throw new Error('Failed to delete certificate');
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    }
  }, [certificates]);

  // Initial fetch
  useEffect(() => {
    fetchCertificates();
    fetchAvailableHosts();
  }, [fetchCertificates, fetchAvailableHosts]);

  return {
    certificates,
    availableHosts,
    loading,
    error,
    createCertificate,
    deleteCertificate,
    refreshCertificate,
    refresh: fetchCertificates,
  };
}
