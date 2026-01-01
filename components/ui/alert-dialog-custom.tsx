"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Context to pass onOpenChange to child components
const AlertDialogContext = React.createContext<{ onOpenChange: (open: boolean) => void } | null>(null)

function useAlertDialogContext() {
  const context = React.useContext(AlertDialogContext)
  if (!context) {
    throw new Error("AlertDialog components must be used within an AlertDialog")
  }
  return context
}

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface AlertDialogContentProps {
  className?: string
  children: React.ReactNode
}

interface AlertDialogHeaderProps {
  className?: string
  children: React.ReactNode
}

interface AlertDialogFooterProps {
  className?: string
  children: React.ReactNode
}

interface AlertDialogTitleProps {
  className?: string
  children: React.ReactNode
}

interface AlertDialogDescriptionProps {
  className?: string
  children: React.ReactNode
}

interface AlertDialogActionProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

interface AlertDialogCancelProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  if (!open) return null

  return (
    <AlertDialogContext.Provider value={{ onOpenChange }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/80 z-40"
          onClick={() => onOpenChange(false)}
        />
        
        {/* Dialog */}
        <div className="relative z-50">
          {children}
        </div>
      </div>
    </AlertDialogContext.Provider>
  )
}

export function AlertDialogContent({ className, children }: AlertDialogContentProps) {
  return (
    <div className={cn(
      "relative grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 rounded-lg",
      "absolute left-[50%] top-[50%]",
      className
    )}>
      {children}
    </div>
  )
}

export function AlertDialogHeader({ className, children }: AlertDialogHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}>
      {children}
    </div>
  )
}

export function AlertDialogFooter({ className, children }: AlertDialogFooterProps) {
  return (
    <div className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}>
      {children}
    </div>
  )
}

export function AlertDialogTitle({ className, children }: AlertDialogTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>
      {children}
    </h2>
  )
}

export function AlertDialogDescription({ className, children }: AlertDialogDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  )
}

export function AlertDialogAction({ className, children, onClick, disabled }: AlertDialogActionProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export function AlertDialogCancel({ className, children, onClick, disabled }: AlertDialogCancelProps) {
  const { onOpenChange } = useAlertDialogContext()
  
  const handleClick = () => {
    onClick?.()
    onOpenChange(false)
  }
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-2 sm:mt-0",
        className
      )}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
