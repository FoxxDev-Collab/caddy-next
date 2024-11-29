'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Sun, Moon, LogOut, Settings, Monitor } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useToast } from '@/app/components/ui/use-toast'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/main' },
    { name: 'Proxy Hosts', href: '/proxy_hosts' },
    { name: 'SSL Certificates', href: '/ssl_management' },
    { name: 'Jobs', href: '/jobs_management' },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const isActive = (path: string) => pathname === path

  const handleThemeChange = async () => {
    try {
      // Cycle through themes: light -> dark -> system
      const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
      setTheme(nextTheme)
      
      // Save theme preference to backend
      const response = await fetch('/api/settings/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: nextTheme }),
      })

      if (!response.ok) {
        throw new Error('Failed to save theme preference')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save theme preference.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      await signOut({ 
        redirect: true,
        callbackUrl: '/login'
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out.",
        variant: "destructive",
      })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex h-16 items-center px-4 md:px-6">
        <nav className="flex-1">
          <ul className="flex space-x-4">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                    isActive(item.href)
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center space-x-4">
          {mounted && (
            <button
              onClick={handleThemeChange}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              ) : theme === 'light' ? (
                <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <Monitor className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          )}

          <button
            onClick={handleLogout}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
