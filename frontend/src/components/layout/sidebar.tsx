"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { 
  Scale, 
  BarChart3, 
  FolderOpen, 
  Users, 
  Truck, 
  Car,
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Shield,
  Zap,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  TrendingUp,
  Eye,
  Award,
  Layers,
  PieChart,
  BarChart4,
  Building2
} from "lucide-react"

// Ultra-Modern Role-Specific Navigation with Contextual Workflows
const getUltraModernNavigation = (userRoles: string[], currentTime: Date = new Date()) => {
  const hasRole = (role: string) => userRoles.includes(role)
  const currentHour = currentTime.getHours()
  const isWorkingHours = currentHour >= 7 && currentHour <= 17
  
  // Operator Timbangan - Process Control Interface
  if (hasRole('operator_timbangan') && !hasRole('admin') && !hasRole('supervisor')) {
    return {
      workflowTitle: "Proses Kontrol Timbangan",
      workflowSteps: ["Persiapan", "Penimbangan", "Verifikasi", "Laporan"],
      currentStep: 1,
      sections: [
        {
          type: "control-center",
          title: "Pusat Kontrol",
          priority: "critical",
          items: [
            {
              title: "Live Timbangan",
              href: "/timbangan",
              icon: Scale,
              type: "action-primary",
              status: isWorkingHours ? "active" : "standby",
              badge: isWorkingHours ? "AKTIF" : "STANDBY",
              description: "Kontrol timbangan real-time",
              metrics: { current: "0.0 kg", target: "50 ton", efficiency: "87%" },
              quickActions: ["Tare", "Start", "Stop"]
            }
          ]
        },
        {
          type: "workflow-timeline",
          title: "Alur Kerja Hari Ini",
          priority: "high",
          items: [
            {
              title: "Dashboard Timbangan",
              href: "/dashboard-timbangan",
              icon: Layers,
              type: "overview",
              status: "completed",
              description: "Monitor performa harian",
              progress: 75
            },
            {
              title: "Cek Master Data",
              icon: FolderOpen,
              type: "data-check",
              status: "in-progress",
              expandable: true,
              children: [
                {
                  title: "Pemasok Aktif",
                  href: "/master/pemasok",
                  icon: Users,
                  status: "ready",
                  count: "23 aktif",
                  lastUpdate: "10 min ago"
                },
                {
                  title: "Sopir & Kendaraan",
                  href: "/master/sopir",
                  icon: Truck,
                  status: "ready",
                  count: "15 sopir, 12 truck",
                  lastUpdate: "5 min ago"
                }
              ]
            }
          ]
        },
        {
          type: "performance-hub",
          title: "Performa & Analytics",
          priority: "medium",
          items: [
            {
              title: "Laporan Harian",
              href: "/laporan/harian",
              icon: BarChart4,
              type: "analytics",
              badge: "Hari ini",
              metrics: { transactions: 24, weight: "15.2 ton" },
              trend: "up"
            },
            {
              title: "Laporan Bulanan",
              href: "/laporan/bulanan",
              icon: PieChart,
              type: "analytics",
              badge: "Nov 2024",
              metrics: { transactions: 580, weight: "387 ton" },
              trend: "stable"
            }
          ]
        }
      ]
    }
  }
  
  // Operator Grading - Quality Intelligence Hub
  if (hasRole('operator_grading') && !hasRole('admin') && !hasRole('supervisor')) {
    return {
      workflowTitle: "Sistem Analisis Kualitas",
      workflowSteps: ["Sampling", "Evaluasi", "Grading", "Validasi"],
      currentStep: 2,
      sections: [
        {
          type: "quality-control",
          title: "Kontrol Kualitas",
          priority: "critical",
          items: [
            {
              title: "Proses Grading",
              href: "/grading",
              icon: Award,
              type: "action-primary",
              status: "active",
              badge: "AKTIF",
              description: "Penilaian kualitas TBS",
              metrics: { pending: "12 batch", completed: "45 today", avgGrade: "B+" },
              quickActions: ["New Assessment", "Batch Grade", "Review"]
            }
          ]
        },
        {
          type: "quality-radar",
          title: "Radar Kualitas",
          priority: "high",
          items: [
            {
              title: "Dashboard Grading",
              href: "/dashboard-grading",
              icon: Target,
              type: "overview",
              status: "monitoring",
              description: "Monitor tren kualitas",
              qualityScore: 85,
              trend: "improving"
            },
            {
              title: "Data Timbangan",
              href: "/timbangan",
              icon: Eye,
              type: "reference",
              status: "available",
              description: "Lihat data untuk grading",
              badge: "View Only",
              count: "24 transaksi baru"
            }
          ]
        },
        {
          type: "intelligence-center",
          title: "Pusat Analitik",
          priority: "high",
          items: [
            {
              title: "Analisis Kualitas",
              href: "/laporan/grading",
              icon: TrendingUp,
              type: "analytics",
              badge: "Real-time",
              description: "Analisis mendalam kualitas",
              insights: ["Grade A: ↑5%", "Supplier XYZ improving", "Quality trend: positive"]
            },
            {
              title: "Referensi Pemasok",
              href: "/master/pemasok",
              icon: Users,
              type: "reference",
              badge: "Reference",
              description: "Data pemasok untuk konteks",
              count: "23 pemasok aktif"
            }
          ]
        }
      ]
    }
  }
  
  // Admin/Supervisor - Command Center
  return {
    workflowTitle: "Pusat Komando Sistem",
    workflowSteps: ["Monitor", "Analyze", "Optimize", "Report"],
    currentStep: 1,
    sections: [
      {
        type: "command-center",
        title: "Kontrol Utama",
        priority: "critical",
        items: [
          {
            title: "Dashboard Admin",
            href: "/",
            icon: Layers,
            type: "command",
            status: "operational",
            badge: "ALL SYSTEMS",
            description: "Kontrol penuh sistem",
            systemHealth: 95
          }
        ]
      },
      {
        type: "operations-hub",
        title: "Hub Operasional",
        priority: "high",
        items: [
          {
            title: "Timbangan Control",
            href: "/timbangan",
            icon: Scale,
            type: "operation",
            status: "active",
            badge: "24 active",
            description: "Monitor semua timbangan"
          },
          {
            title: "Quality Control",
            href: "/grading",
            icon: Award,
            type: "operation",
            status: "active",
            badge: "12 pending",
            description: "Monitor kualitas global"
          }
        ]
      },
      {
        type: "management-suite",
        title: "Suite Manajemen",
        priority: "medium",
        expandable: true,
        items: [
          {
            title: "Master Data",
            icon: FolderOpen,
            type: "management",
            expandable: true,
            children: [
              { title: "Pemasok", href: "/master/pemasok", icon: Users, count: "23" },
              { title: "Sopir", href: "/master/sopir", icon: Truck, count: "15" },
              { title: "Kendaraan", href: "/master/kendaraan", icon: Car, count: "12" }
            ]
          },
          {
            title: "Analytics & Reports",
            icon: BarChart3,
            type: "analytics",
            expandable: true,
            children: [
              { title: "Laporan Harian", href: "/laporan/harian", icon: Calendar },
              { title: "Laporan Bulanan", href: "/laporan/bulanan", icon: CalendarDays },
              { title: "Laporan Grading", href: "/laporan/grading", icon: Award }
            ]
          },
          {
            title: "User Management",
            icon: Shield,
            type: "admin",
            badge: "Admin Only",
            expandable: true,
            requiredRoles: ["admin"],
            children: [
              { title: "Users", href: "/admin/users", icon: Users },
              { title: "Roles", href: "/admin/roles", icon: Shield },
              { title: "Company Profile", href: "/admin/company", icon: Building2 },
              { title: "Scale Computers", href: "/admin/scale-computers", icon: Scale }
            ]
          }
        ]
      }
    ]
  }
}

export function Sidebar() {
  const pathname = usePathname()
  const { hasRole, user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute for dynamic content
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Get user roles from different possible formats and ultra-modern navigation
  const getUserRoles = () => {
    if (!user) return []
    
    // Check single role format
    if (user.role?.name) {
      return [user.role.name]
    }
    
    // Check userRole format
    if (user.userRole?.role?.name) {
      return [user.userRole.role.name]
    }
    
    // Check legacy roles array
    if (user.roles && user.roles.length > 0) {
      return user.roles.map(role => role.nama || role.name).filter(Boolean)
    }
    
    return []
  }
  
  const userRoles = getUserRoles()
  const navigation = getUltraModernNavigation(userRoles, currentTime)

  const hasAccessToItem = (requiredRoles: string[] = []) => {
    if (requiredRoles.length === 0) return true
    return requiredRoles.some(role => hasRole(role))
  }

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }))
  }

  // Ultra-modern styling system
  const getTypeStyles = (type: string, status?: string, priority?: string) => {
    const baseStyles = "transition-all duration-300 ease-in-out"
    
    switch (type) {
      case 'action-primary':
        return {
          container: cn(baseStyles, "bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl hover:shadow-2xl border-2 border-primary/20 hover:scale-[1.02]"),
          icon: "bg-white/20 text-white",
          badge: status === 'active' ? "bg-green-400 text-white animate-pulse" : "bg-yellow-400 text-black"
        }
      case 'control-center':
        return {
          container: cn(baseStyles, "bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 hover:border-red-300 hover:shadow-lg"),
          icon: "bg-red-100 text-red-600",
          badge: "bg-red-500 text-white"
        }
      case 'quality-control':
        return {
          container: cn(baseStyles, "bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 hover:border-emerald-300 hover:shadow-lg"),
          icon: "bg-emerald-100 text-emerald-600",
          badge: "bg-emerald-500 text-white"
        }
      case 'command':
        return {
          container: cn(baseStyles, "bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 hover:border-purple-300 hover:shadow-lg"),
          icon: "bg-purple-100 text-purple-600",
          badge: "bg-purple-500 text-white"
        }
      case 'overview':
        return {
          container: cn(baseStyles, "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 hover:border-blue-300 hover:shadow-md"),
          icon: "bg-blue-100 text-blue-600",
          badge: "bg-blue-500 text-white"
        }
      case 'analytics':
        return {
          container: cn(baseStyles, "bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 hover:border-violet-300 hover:shadow-md"),
          icon: "bg-violet-100 text-violet-600",
          badge: "bg-violet-500 text-white"
        }
      case 'reference':
        return {
          container: cn(baseStyles, "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 hover:border-gray-300"),
          icon: "bg-gray-100 text-gray-600",
          badge: "bg-gray-400 text-white"
        }
      default:
        return {
          container: cn(baseStyles, "bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm"),
          icon: "bg-slate-100 text-slate-600",
          badge: "bg-slate-400 text-white"
        }
    }
  }

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'active': return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      case 'standby': return <div className="w-2 h-2 bg-yellow-500 rounded-full" />
      case 'completed': return <CheckCircle className="w-3 h-3 text-green-500" />
      case 'in-progress': return <Clock className="w-3 h-3 text-blue-500 animate-pulse" />
      case 'monitoring': return <Activity className="w-3 h-3 text-blue-500" />
      case 'operational': return <Zap className="w-3 h-3 text-green-500" />
      default: return <div className="w-2 h-2 bg-gray-300 rounded-full" />
    }
  }


  return (
    <div className={cn(
      "flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-r border-slate-200 dark:border-slate-700/50 transition-all duration-300 ease-in-out relative shadow-xl",
      isCollapsed ? "w-20" : "w-72"
    )}>
      {/* Header */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                SmartMillScale
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {userRoles.includes('operator_timbangan') && !userRoles.includes('admin') && !userRoles.includes('supervisor') 
                  ? "Sistem Penimbangan Digital"
                  : userRoles.includes('operator_grading') && !userRoles.includes('admin') && !userRoles.includes('supervisor')
                  ? "Sistem Penilaian Kualitas"
                  : "Timbang Otomatis, Proses Sistematis"}
              </p>
              {userRoles.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {userRoles.slice(0, 2).map((role, index) => (
                    <span key={index} className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
                      {role.replace('operator_', '').replace('_', ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {/* Workflow Header */}
      {!isCollapsed && (
        <div className="px-4 py-2 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            {navigation.workflowTitle}
          </div>
          <div className="flex items-center space-x-2">
            {navigation.workflowSteps.map((step, index) => (
              <div key={step} className={cn(
                "flex items-center text-xs px-2 py-1 rounded-full transition-colors",
                index < navigation.currentStep 
                  ? "bg-green-100 text-green-700" 
                  : index === navigation.currentStep 
                    ? "bg-primary/20 text-primary font-medium" 
                    : "bg-slate-100 text-slate-500"
              )}>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {navigation.sections.filter(section => 
          section.items.some(item => hasAccessToItem(item.requiredRoles))
        ).map((section, sectionIndex) => {
          return (
            <div key={sectionIndex} className="space-y-2">
              {!isCollapsed && (
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                  {section.priority === 'critical' && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
              )}
              
              {section.items.filter(item => hasAccessToItem(item.requiredRoles)).map((item, itemIndex) => {
                const itemStyles = getTypeStyles(item.type, item.status, section.priority)
                const isExpandable = item.expandable && item.children
                const isExpanded = expandedSections[`${section.type}-${item.title}`]
                
                return (
                  <div key={itemIndex} className="space-y-1">
                    {item.href ? (
                      <Link href={item.href}>
                        <div className={cn(
                          "group relative flex items-center p-3 rounded-xl transition-all duration-300 ease-in-out",
                          itemStyles.container,
                          pathname === item.href && "ring-2 ring-primary/20 shadow-lg scale-[1.02]"
                        )}>
                          <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 relative",
                            itemStyles.icon
                          )}>
                            <item.icon className="h-5 w-5" />
                            {item.status && (
                              <div className="absolute -bottom-1 -right-1">
                                {getStatusIndicator(item.status)}
                              </div>
                            )}
                          </div>
                          
                          {!isCollapsed && (
                            <div className="ml-3 flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-slate-800 dark:text-white">
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <Badge className={itemStyles.badge}>
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              {item.description && (
                                <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                  {item.description}
                                </div>
                              )}
                              
                              {/* Metrics Display */}
                              {item.metrics && (
                                <div className="flex items-center space-x-3 text-xs">
                                  {Object.entries(item.metrics).map(([key, value]) => (
                                    <span key={key} className="text-slate-500">
                                      {key}: <span className="font-medium text-slate-700 dark:text-slate-300">{value}</span>
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              {/* Progress Bar */}
                              {item.progress && (
                                <Progress value={item.progress} className="mt-2 h-1" />
                              )}
                              
                              {/* Quick Actions */}
                              {item.quickActions && (
                                <div className="flex items-center space-x-1 mt-2">
                                  {item.quickActions.map((action, actionIndex) => (
                                    <Button key={actionIndex} size="sm" variant="ghost" className="h-6 text-xs px-2">
                                      {action}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {pathname === item.href && (
                            <div className="absolute inset-y-0 right-0 w-1 bg-primary rounded-l-full" />
                          )}
                        </div>
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleSection(`${section.type}-${item.title}`)}
                          className={cn(
                            "group w-full flex items-center p-3 rounded-xl transition-all duration-200 ease-in-out",
                            itemStyles.container
                          )}
                        >
                          <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
                            itemStyles.icon
                          )}>
                            <item.icon className="h-5 w-5" />
                          </div>
                          
                          {!isCollapsed && (
                            <div className="ml-3 flex-1 flex items-center justify-between">
                              <div>
                                <span className="font-medium text-slate-800 dark:text-white">
                                  {item.title}
                                </span>
                                {item.count && (
                                  <span className="text-xs text-slate-500 ml-2">{item.count}</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {item.badge && (
                                  <Badge className={itemStyles.badge} variant="outline">
                                    {item.badge}
                                  </Badge>
                                )}
                                {isExpandable && (
                                  isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-slate-500" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-slate-500" />
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </button>
                        
                        {/* Expandable Children */}
                        {isExpandable && isExpanded && !isCollapsed && (
                          <div className="ml-4 mt-2 space-y-1 border-l-2 border-slate-200 dark:border-slate-700/50 pl-4">
                            {item.children?.filter(child => hasAccessToItem(child.requiredRoles)).map((child, childIndex) => (
                              <Link key={childIndex} href={child.href}>
                                <div className={cn(
                                  "group flex items-center p-2.5 rounded-lg transition-all duration-200 ease-in-out",
                                  "hover:bg-slate-100/50 dark:hover:bg-slate-700/30",
                                  pathname === child.href && "bg-primary/10 border-l-2 border-primary"
                                )}>
                                  <div className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                                    pathname === child.href 
                                      ? "bg-primary/20 text-primary" 
                                      : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                                  )}>
                                    <child.icon className="h-4 w-4" />
                                  </div>
                                  <div className="ml-3 flex-1">
                                    <div className={cn(
                                      "text-sm font-medium transition-colors",
                                      pathname === child.href 
                                        ? "text-primary" 
                                        : "text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white"
                                    )}>
                                      {child.title}
                                    </div>
                                    {child.count && (
                                      <div className="text-xs text-slate-400 mt-0.5">
                                        {child.count}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
        {!isCollapsed ? (
          <div className="text-center">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">SmartMillScale System</div>
            <div className="text-xs text-slate-400 dark:text-slate-500">v1.0.0</div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
          </div>
        )}
      </div>
    </div>
  )
}