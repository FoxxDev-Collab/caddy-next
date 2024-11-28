import { Header } from "@/app/components/Header"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <main className="transition-colors">
        {children}
      </main>
    </div>
  )
}
