import { LoadingSpinner } from "./loading-spinner"
import { cn } from "@/lib/utils"

interface LoadingProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
}

export function Loading({ className, size = "md", text }: LoadingProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-4",
      size === "sm" && "py-8",
      size === "md" && "py-16",
      size === "lg" && "py-24",
      className
    )}>
      <LoadingSpinner size={size} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
}

export function PageLoading({ text = "Memuat halaman..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loading size="lg" text={text} />
    </div>
  )
}