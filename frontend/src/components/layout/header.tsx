"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, Bell, Settings, Sun, Moon, Monitor, Palette, LogOut, ChevronDown } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/contexts/auth-context"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  // Simple page title mapping
  const getPageTitle = (path: string) => {
    const titles: Record<string, string> = {
      '/': 'Dashboard',
      '/timbangan': 'Timbangan',
      '/grading': 'Grading',
      '/master/pemasok': 'Data Pemasok',
      '/master/sopir': 'Data Sopir',
      '/master/kendaraan': 'Data Kendaraan',
      '/laporan/harian': 'Laporan Harian',
      '/laporan/bulanan': 'Laporan Bulanan',
      '/laporan/grading': 'Laporan Grading',
      '/admin/users': 'Manajemen User',
      '/admin/roles': 'Manajemen Role',
    }
    return titles[path] || 'SmartMillScale'
  }
  
  const currentTime = new Date().toLocaleString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const pageTitle = getPageTitle(pathname)

  const handleLogout = () => {
    setIsLoggingOut(true)
    setShowUserMenu(false)
    // Immediate logout - no delay
    logout()
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      case "violet":
      case "violet-dark":
        return <Palette className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const cycleTheme = () => {
    const themes = ["light", "dark", "violet", "violet-dark", "system"] as const
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Page title and time */}
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              {pageTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{currentTime}</p>
          </div>
        </div>
        
        {/* Right side - Controls and user menu */}
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={cycleTheme}
            className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
            title={`Current theme: ${theme}`}
          >
            {getThemeIcon()}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
          
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              disabled={isLoggingOut}
              className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50"
            >
              <User className="mr-2 h-4 w-4" />
              <div className="flex flex-col items-start mr-2">
                <span className="font-medium text-sm">{user?.fullName}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {isLoggingOut ? 'Logging out...' : (user?.role?.name || 'No Role')}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.fullName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Role: {user?.role?.name || 'No Role'}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}