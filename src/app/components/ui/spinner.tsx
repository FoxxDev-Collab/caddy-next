import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Spinner({ className, size = "md" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <svg
      className={cn(
        "animate-spin text-current",
        sizeClasses[size],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-2">
        <Spinner size="md" className="text-primary" />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    </div>
  )
}

export function TableLoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="flex flex-col items-center space-y-2">
        <Spinner size="lg" className="text-primary" />
        <span className="text-sm text-gray-500 font-medium">Loading...</span>
      </div>
    </div>
  )
}
