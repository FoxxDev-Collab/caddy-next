import { useCallback, useEffect, useState, useRef } from 'react';
import { SSLCertificate } from '@/lib/caddy/types';
import { useApi } from './useApi';
import { useToast } from '@/app/components/ui/use-toast';

export function useSSL() {
  const [certificates, setCertificates] = useState<SSLCertificate[]>([]);
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

  const createCertificate = useCallback(async (domain: string) => {
    try {
      const newCert = await apiRef.current.post<SSLCertificate>('/api/ssl', { domain }, {
        showSuccessToast: true,
        successMessage: 'SSL certificate created successfully'
      });
      
      if (newCert && newCert.id && newCert.domain) {
        setCertificates(prev => [...prev, newCert]);
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

  const deleteCertificate = useCallback(async (id: string) => {
    try {
      const result = await apiRef.current.delete<{ success: boolean }>(`/api/ssl?id=${id}`, {
        showSuccessToast: true,
        successMessage: 'SSL certificate deleted successfully'
      });
      
      if (result?.success) {
        setCertificates(prev => prev.filter(cert => cert.id !== id));
        setError(null);
      } else {
        throw new Error('Failed to delete certificate');
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    }
  }, []);

  // Initial fetch - now with stable fetchCertificates reference
  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return {
    certificates,
    loading,
    error,
    createCertificate,
    deleteCertificate,
    refresh: fetchCertificates,
  };
}