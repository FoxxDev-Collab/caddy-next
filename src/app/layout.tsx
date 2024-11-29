import './globals.css'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Providers from './providers'
import { Toaster } from './components/ui/toaster'
import { TooltipProvider } from './components/ui/tooltip'
import { SystemInitializer } from './components/SystemInitializer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground">
              <SystemInitializer />
              {children}
              <Toaster />
            </div>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  )
}
