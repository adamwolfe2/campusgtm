"use client"

import { ReactNode, forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export interface NotionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const NotionButton = forwardRef<HTMLButtonElement, NotionButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading,
      leftIcon,
      rightIcon,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "notion-button",
      "inline-flex items-center justify-center gap-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "font-medium"
    )

    const variants = {
      primary: "bg-[var(--interactive)] text-white hover:bg-[var(--interactive-hover)] shadow-sm",
      secondary: "bg-[var(--accent-bg)] text-[var(--accent-text)] hover:bg-[var(--interactive)]/10",
      ghost: "text-[var(--text-primary)] hover:bg-[var(--hover-bg)]",
      destructive: "bg-[var(--error)] text-white hover:bg-[var(--error)]/90",
    }

    const sizes = {
      sm: "px-3 py-1.5 text-sm h-8",
      md: "px-4 py-2 text-sm h-9",
      lg: "px-6 py-3 text-base h-11",
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {rightIcon}
      </button>
    )
  }
)

NotionButton.displayName = "NotionButton"
