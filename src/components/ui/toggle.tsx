'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 gap-2',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-3 min-w-10',
        sm: 'h-9 px-2.5 min-w-9',
        lg: 'h-11 px-5 min-w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      variant,
      size,
      pressed: pressedProp,
      onPressedChange,
      onClick,
      type,
      ...props
    },
    ref,
  ) => {
    const [pressed, setPressed] = React.useState<boolean>(pressedProp ?? false)

    React.useEffect(() => {
      if (pressedProp !== undefined) {
        setPressed(pressedProp)
      }
    }, [pressedProp])

    const handleClick = React.useCallback<
      React.MouseEventHandler<HTMLButtonElement>
    >(
      (event) => {
        onClick?.(event)
        if (event.defaultPrevented) {
          return
        }

        const next = !pressed
        if (pressedProp === undefined) {
          setPressed(next)
        }
        onPressedChange?.(next)
      },
      [onClick, onPressedChange, pressed, pressedProp],
    )

    return (
      <button
        type={type ?? 'button'}
        ref={ref}
        data-state={pressed ? 'on' : 'off'}
        aria-pressed={pressed}
        className={cn(toggleVariants({ variant, size, className }))}
        onClick={handleClick}
        {...props}
      />
    )
  },
)

Toggle.displayName = 'Toggle'

export { Toggle, toggleVariants }
