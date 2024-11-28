'use client'

import { Globe, Shield, Clock, LineChart } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card"
import { useHosts } from "@/lib/hooks/useHosts"
import { useSSL } from "@/lib/hooks/useSSL"

export default function MainPage() {
  const { hosts, isLoading: hostsLoading } = useHosts()
  const { certificates, loading: sslLoading } = useSSL()
  
  // Helper function to check if a certificate is expired
  const isCertExpired = (validTo: Date) => {
    return new Date(validTo) < new Date()
  }

  // Count valid certificates
  const validCertificates = certificates.filter(cert => !isCertExpired(cert.validTo))
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Proxy Hosts Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Proxy Hosts</CardTitle>
            <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hostsLoading ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded" />
              ) : (
                hosts.length
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {hosts.filter(host => host.enabled).length} active
            </p>
          </CardContent>
        </Card>

        {/* SSL Certificates Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">SSL Certificates</CardTitle>
            <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sslLoading ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded" />
              ) : (
                certificates.length
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {validCertificates.length} valid
            </p>
          </CardContent>
        </Card>

        {/* Jobs Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Jobs</CardTitle>
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Scheduled tasks</p>
          </CardContent>
        </Card>

        {/* Traffic Monitor Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Traffic Monitor</CardTitle>
            <LineChart className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active connections</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Proxy Hosts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Proxy Hosts</CardTitle>
          </CardHeader>
          <CardContent>
            {hostsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : hosts.length > 0 ? (
              <div className="space-y-4">
                {hosts.slice(0, 5).map((host) => (
                  <div key={host.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Globe className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium">{host.domain}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {host.enabled ? 'Active' : 'Inactive'} • {host.ssl ? 'SSL Enabled' : 'No SSL'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] border-2 border-dashed rounded-lg border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No proxy hosts configured</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SSL Certificates */}
        <Card>
          <CardHeader>
            <CardTitle>SSL Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            {sslLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : certificates.length > 0 ? (
              <div className="space-y-4">
                {certificates.slice(0, 5).map((cert) => (
                  <div key={cert.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Shield className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium">{cert.domain}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isCertExpired(cert.validTo) ? 'Expired' : 'Valid'} • {cert.autoRenew ? 'Auto-renew On' : 'Auto-renew Off'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] border-2 border-dashed rounded-lg border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No SSL certificates configured</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
