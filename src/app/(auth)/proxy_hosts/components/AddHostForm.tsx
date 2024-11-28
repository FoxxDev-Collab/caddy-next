import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { useToast } from '@/app/components/ui/use-toast'
import { Label } from '@/app/components/ui/label'
import { Switch } from '@/app/components/ui/switch'
import { CaddyHost } from '@/lib/caddy/types'

interface AddHostFormProps {
  onSubmit: (data: Omit<CaddyHost, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export function AddHostForm({ onSubmit, onCancel }: AddHostFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    domain: '',
    targetHost: '',
    targetPort: '80',
    ssl: true,
    forceSSL: true,
    autoRenew: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Domain validation
    if (!formData.domain) {
      newErrors.domain = 'Domain is required'
    } else if (!/^([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.)+[a-zA-Z]{2,}$|^(\d{1,3}\.){3}\d{1,3}$/.test(formData.domain)) {
      newErrors.domain = 'Invalid domain or IP address'
    }

    // Target Host validation
    if (!formData.targetHost) {
      newErrors.targetHost = 'Target host is required'
    } else if (!/^localhost$|^(\d{1,3}\.){3}\d{1,3}$|^([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.)+[a-zA-Z]{2,}$/.test(formData.targetHost)) {
      newErrors.targetHost = 'Invalid target host'
    }

    // Port validation
    const port = parseInt(formData.targetPort)
    if (isNaN(port) || port < 1 || port > 65535) {
      newErrors.targetPort = 'Invalid port number (1-65535)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        targetPort: parseInt(formData.targetPort),
        enabled: true
      })
    } else {
      toast({
        title: "Invalid Form",
        description: "Please correct the errors below",
        variant: "destructive"
      })
    }
  }

  const handleSSLChange = (enabled: boolean) => {
    setFormData({
      ...formData,
      ssl: enabled,
      forceSSL: enabled && formData.forceSSL,
      autoRenew: enabled && formData.autoRenew
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="domain">Domain</Label>
          <Input
            id="domain"
            placeholder="example.com"
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            className={errors.domain ? "border-red-500" : ""}
          />
          {errors.domain && <p className="text-sm text-red-500">{errors.domain}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetHost">Target Host or IP Address</Label>
          <Input
            id="targetHost"
            placeholder="localhost"
            value={formData.targetHost}
            onChange={(e) => setFormData({ ...formData, targetHost: e.target.value })}
            className={errors.targetHost ? "border-red-500" : ""}
          />
          {errors.targetHost && <p className="text-sm text-red-500">{errors.targetHost}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetPort">Port</Label>
          <Input
            id="targetPort"
            type="number"
            placeholder="80"
            value={formData.targetPort}
            onChange={(e) => setFormData({ ...formData, targetPort: e.target.value })}
            className={errors.targetPort ? "border-red-500" : ""}
          />
          {errors.targetPort && <p className="text-sm text-red-500">{errors.targetPort}</p>}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ssl">SSL</Label>
              <p className="text-sm text-muted-foreground">
                Enable HTTPS for this host
              </p>
            </div>
            <Switch
              id="ssl"
              checked={formData.ssl}
              onCheckedChange={handleSSLChange}
            />
          </div>

          {formData.ssl && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="forceSSL">Force SSL</Label>
                  <p className="text-sm text-muted-foreground">
                    Redirect HTTP to HTTPS
                  </p>
                </div>
                <Switch
                  id="forceSSL"
                  checked={formData.forceSSL}
                  onCheckedChange={(checked) => setFormData({ ...formData, forceSSL: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoRenew">Auto-Renew Certificate</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically renew SSL certificate before expiration
                  </p>
                </div>
                <Switch
                  id="autoRenew"
                  checked={formData.autoRenew}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoRenew: checked })}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Host
        </Button>
      </div>
    </form>
  )
}
