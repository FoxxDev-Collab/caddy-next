"use client"

import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Switch } from "@/app/components/ui/switch"
import { useState } from "react"
import { useToast } from "@/app/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"

interface SSLSettings {
  cloudflare: {
    enabled: boolean
    apiToken: string
  }
  autoRenewal: {
    enabled: boolean
    daysBeforeExpiry: number
  }
}

export function SSLSettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [settings, setSettings] = useState<SSLSettings>({
    cloudflare: {
      enabled: false,
      apiToken: ""
    },
    autoRenewal: {
      enabled: true,
      daysBeforeExpiry: 30
    }
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/settings/ssl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      toast({
        title: "Success",
        description: "SSL settings have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update SSL settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("certificate", file)

    try {
      const response = await fetch("/api/settings/ssl/certificate", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload certificate")
      }

      toast({
        title: "Success",
        description: "Custom certificate has been uploaded.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload custom certificate.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Auto-Renewal Settings</CardTitle>
            <CardDescription>Configure automatic SSL certificate renewal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Auto-Renewal</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically renew certificates before they expire
                </p>
              </div>
              <Switch
                checked={settings.autoRenewal.enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({
                    ...prev,
                    autoRenewal: { ...prev.autoRenewal, enabled: checked }
                  }))
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="daysBeforeExpiry">Days Before Expiry</Label>
              <Input
                id="daysBeforeExpiry"
                type="number"
                min={1}
                max={90}
                value={settings.autoRenewal.daysBeforeExpiry}
                onChange={(e) => 
                  setSettings(prev => ({
                    ...prev,
                    autoRenewal: { ...prev.autoRenewal, daysBeforeExpiry: parseInt(e.target.value) }
                  }))
                }
                disabled={!settings.autoRenewal.enabled || isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Number of days before expiry to attempt renewal
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Cloudflare Integration</CardTitle>
            <CardDescription>Use Cloudflare for SSL certificate management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Cloudflare</Label>
                <p className="text-sm text-muted-foreground">
                  Use Cloudflare API for certificate management
                </p>
              </div>
              <Switch
                checked={settings.cloudflare.enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({
                    ...prev,
                    cloudflare: { ...prev.cloudflare, enabled: checked }
                  }))
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cloudflareToken">API Token</Label>
              <Input
                id="cloudflareToken"
                type="password"
                value={settings.cloudflare.apiToken}
                onChange={(e) => 
                  setSettings(prev => ({
                    ...prev,
                    cloudflare: { ...prev.cloudflare, apiToken: e.target.value }
                  }))
                }
                disabled={!settings.cloudflare.enabled || isLoading}
                placeholder="Enter your Cloudflare API token"
              />
              <p className="text-sm text-muted-foreground">
                Your Cloudflare API token with SSL/TLS permissions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Custom Certificate</CardTitle>
            <CardDescription>Upload your own SSL certificate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customCert">Certificate File</Label>
              <Input
                id="customCert"
                type="file"
                accept=".pem,.crt,.cert"
                onChange={handleCustomCertUpload}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Upload a PEM-encoded SSL certificate
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
