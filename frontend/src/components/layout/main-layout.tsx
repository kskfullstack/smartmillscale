"use client"

import { useAuth } from "@/contexts/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Don't show sidebar/header for login, unauthorized, and timbangan pages
  const isAuthPage = pathname === '/login' || pathname === '/unauthorized' || pathname === '/timbangan'

  // Redirect operator_timbangan users to timbangan page if they try to access other routes
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && hasRole('operator_timbangan') && pathname !== '/timbangan') {
      router.push('/timbangan')
    }
  }, [isLoading, isAuthenticated, user, hasRole, pathname, router])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated || isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out">
        <Header />
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}