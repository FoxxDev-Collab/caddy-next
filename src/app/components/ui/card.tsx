import { ReactNode } from 'react'

export interface CardProps {
  children: ReactNode
  className?: string
}

export interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export interface CardTitleProps {
  children: ReactNode
  className?: string
}

export interface CardContentProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-all hover:shadow-md ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div className={`p-6 pb-3 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = "" }: CardTitleProps) {
  return (
    <h3 className={`font-semibold leading-none tracking-tight ${className}`}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return (
    <div className={`p-6 pt-3 ${className}`}>
      {children}
    </div>
  )
}
