"use client"

import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { useState, useEffect } from "react"
import { useToast } from "@/app/components/ui/use-toast"
import type { CaddyConfig } from "@/lib/caddy/types"

export function CaddySettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [settings, setSettings] = useState<CaddyConfig["globalSettings"]>({
    defaultSNIHost: "",
    logLevel: "INFO"
  })

  // Fetch current settings on component mount
  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings/caddy")
      if (!response.ok) throw new Error("Failed to fetch settings")
      const data = await response.json()
      setSettings(data.globalSettings)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load Caddy settings.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/settings/caddy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          globalSettings: settings
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      toast({
        title: "Success",
        description: "Caddy settings have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update Caddy settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="defaultSNIHost">Default SNI Host</Label>
        <Input
          id="defaultSNIHost"
          placeholder="Enter default SNI host"
          value={settings.defaultSNIHost || ""}
          onChange={(e) => setSettings(prev => ({ ...prev, defaultSNIHost: e.target.value }))}
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground">
          The default server name to use when SNI is not provided by the client
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="logLevel">Log Level</Label>
        <Select
          value={settings.logLevel}
          onValueChange={(value) => setSettings(prev => ({ ...prev, logLevel: value as CaddyConfig["globalSettings"]["logLevel"] }))}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select log level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DEBUG">Debug</SelectItem>
            <SelectItem value="INFO">Info</SelectItem>
            <SelectItem value="WARN">Warning</SelectItem>
            <SelectItem value="ERROR">Error</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Controls the verbosity of Caddy&apos;s logging output
        </p>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
