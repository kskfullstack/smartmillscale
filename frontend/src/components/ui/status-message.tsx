"use client"

import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"

interface StatusMessageProps {
  type: "error" | "success" | "warning" | "info"
  message: string
  className?: string
  onClose?: () => void
}

export function StatusMessage({ type, message, className, onClose }: StatusMessageProps) {
  const variants = {
    error: {
      container: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300",
      icon: AlertCircle,
      iconColor: "text-red-500"
    },
    success: {
      container: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
      icon: CheckCircle,
      iconColor: "text-emerald-500"
    },
    warning: {
      container: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300",
      icon: AlertTriangle,
      iconColor: "text-yellow-500"
    },
    info: {
      container: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
      icon: Info,
      iconColor: "text-blue-500"
    }
  }

  const variant = variants[type]
  const Icon = variant.icon

  return (
    <div className={cn(
      "flex items-center space-x-3 p-4 border rounded-xl animate-in slide-in-from-top-2 duration-300",
      variant.container,
      className
    )}>
      <Icon className={cn("h-5 w-5 flex-shrink-0", variant.iconColor)} />
      <p className="text-sm flex-1">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-current hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      )}
    </div>
  )
}