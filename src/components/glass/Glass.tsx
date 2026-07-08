import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface GlassProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds hover-lift + pointer affordance. */
  interactive?: boolean
  /** More opaque surface, for text-heavy panels that need contrast. */
  strong?: boolean
}

/** A Liquid Glass surface: frosted, refractive, with a specular rim. */
export function Glass({ interactive, strong, className, ...rest }: GlassProps) {
  return (
    <div
      className={cn(
        'glass',
        strong && 'glass-strong',
        interactive && 'glass-interactive',
        className,
      )}
      {...rest}
    />
  )
}
