"use client"

import { ReactNode, forwardRef } from "react"
import { cn } from "@/lib/utils"
import Float from "@/fancy/blocks/float"

export interface NotionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  float?: boolean
  floatSpeed?: number
  icon?: ReactNode
  title?: string
  description?: string
  actions?: ReactNode
  header?: ReactNode
  footer?: ReactNode
}

export const NotionCard = forwardRef<HTMLDivElement, NotionCardProps>(
  (
    {
      children,
      hover = true,
      float = false,
      floatSpeed = 0.3,
      icon,
      title,
      description,
      actions,
      header,
      footer,
      className,
      ...props
    },
    ref
  ) => {
    const card = (
      <div
        ref={ref}
        className={cn(
          "notion-card",
          hover && "hover:shadow-md hover:-translate-y-0.5",
          "transition-all duration-[var(--duration-fast)]",
          className
        )}
        {...props}
      >
        {/* Header */}
        {(header || icon || title) && (
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {icon && (
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center flex-shrink-0">
                  {icon}
                </div>
              )}
              <div className="min-w-0 flex-1">
                {title && (
                  <h3 className="font-semibold text-base text-[var(--text-primary)] truncate">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {actions && <div className="flex-shrink-0 ml-4">{actions}</div>}
          </div>
        )}

        {/* Custom header */}
        {header}

        {/* Content */}
        {children && <div className="px-6 pb-6">{children}</div>}

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--background-secondary)]">
            {footer}
          </div>
        )}
      </div>
    )

    if (float) {
      return (
        <Float speed={floatSpeed} amplitude={[5, 10, 5]}>
          {card}
        </Float>
      )
    }

    return card
  }
)

NotionCard.displayName = "NotionCard"
