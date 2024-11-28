"use client"

import { Button } from "@/app/components/ui/button"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { useToast } from "@/app/components/ui/use-toast"

export function ThemeSettingsForm() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Load initial theme preference from backend
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const response = await fetch("/api/settings/theme")
        if (response.ok) {
          const data = await response.json()
          setTheme(data.theme)
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error)
      }
    }

    loadThemePreference()
  }, [setTheme])

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleThemeChange = async (newTheme: string) => {
    setIsLoading(true)
    try {
      setTheme(newTheme)
      
      const response = await fetch("/api/settings/theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme: newTheme }),
      })

      if (!response.ok) {
        throw new Error("Failed to update theme")
      }

      toast({
        title: "Success",
        description: "Theme settings have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update theme settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="theme">Theme Preference</Label>
        <Select
          value={theme}
          onValueChange={handleThemeChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Choose your preferred theme. Select &quot;System&quot; to automatically match your device settings.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Preview</h3>
        <div className="grid gap-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <div className="text-sm font-medium">Sample Text</div>
            <p className="text-sm text-muted-foreground">
              This is how text will appear in your selected theme.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="default">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
