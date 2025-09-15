'use client'

import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Toggle, toggleVariants } from '@/components/ui/toggle'

type ToggleGroupVariantProps = VariantProps<typeof toggleVariants>

type SingleValue = string | undefined

type ToggleGroupContextValue = ToggleGroupVariantProps & {
  type: 'single' | 'multiple'
  values: string[]
  onItemToggle: (value: string, pressed: boolean) => void
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(
  null,
)

type BaseToggleGroupProps = React.HTMLAttributes<HTMLDivElement> &
  ToggleGroupVariantProps & {
    disabled?: boolean
  }

interface SingleToggleGroupProps extends BaseToggleGroupProps {
  type?: 'single'
  value?: string
  defaultValue?: string
  onValueChange?: (value: SingleValue) => void
}

interface MultipleToggleGroupProps extends BaseToggleGroupProps {
  type: 'multiple'
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

type ToggleGroupProps = SingleToggleGroupProps | MultipleToggleGroupProps

function toArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value
  }
  return value ? [value] : []
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  (
    {
      className,
      children,
      type = 'single',
      variant = 'default',
      size = 'default',
      value,
      defaultValue,
      onValueChange,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isControlled = value !== undefined
    const initial = toArray(isControlled ? value : defaultValue)
    const [internalValues, setInternalValues] = React.useState<string[]>(initial)

    React.useEffect(() => {
      if (isControlled) {
        setInternalValues(toArray(value))
      }
    }, [isControlled, value])

    const values = isControlled ? toArray(value) : internalValues

    const handleItemToggle = React.useCallback(
      (itemValue: string, pressed: boolean) => {
        let nextValues: string[]
        if (type === 'single') {
          nextValues = pressed ? [itemValue] : []
          if (!isControlled) {
            setInternalValues(nextValues)
          }
          const nextValue: SingleValue = nextValues[0]
          ;(onValueChange as SingleToggleGroupProps['onValueChange'])?.(nextValue)
          return
        }

        const current = new Set(values)
        if (pressed) {
          current.add(itemValue)
        } else {
          current.delete(itemValue)
        }
        nextValues = Array.from(current)
        if (!isControlled) {
          setInternalValues(nextValues)
        }
        ;(onValueChange as MultipleToggleGroupProps['onValueChange'])?.(
          nextValues,
        )
      },
      [isControlled, onValueChange, type, values],
    )

    const contextValue = React.useMemo<ToggleGroupContextValue>(
      () => ({
        type,
        values,
        onItemToggle: handleItemToggle,
        variant,
        size,
      }),
      [handleItemToggle, size, type, values, variant],
    )

    return (
      <div
        ref={ref}
        role={type === 'single' ? 'radiogroup' : 'group'}
        aria-disabled={disabled}
        className={cn('flex items-center justify-center gap-1', className)}
        {...props}
      >
        <ToggleGroupContext.Provider value={contextValue}>
          {children}
        </ToggleGroupContext.Provider>
      </div>
    )
  },
)

ToggleGroup.displayName = 'ToggleGroup'

type ToggleComponentProps = React.ComponentPropsWithoutRef<typeof Toggle>

type ToggleGroupItemProps = Omit<
  ToggleComponentProps,
  'value' | 'pressed' | 'onPressedChange'
> & {
  value: string
  onPressedChange?: (pressed: boolean) => void
}

const ToggleGroupItem = React.forwardRef<
  HTMLButtonElement,
  ToggleGroupItemProps
>(({ value, variant, size, onPressedChange, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)
  if (!context) {
    throw new Error('ToggleGroupItem must be used within a ToggleGroup')
  }

  const pressed = context.values.includes(value)

  return (
    <Toggle
      ref={ref}
      value={value}
      variant={variant ?? context.variant}
      size={size ?? context.size}
      pressed={pressed}
      onPressedChange={(next) => {
        context.onItemToggle(value, next)
        onPressedChange?.(next)
      }}
      {...props}
    />
  )
})

ToggleGroupItem.displayName = 'ToggleGroupItem'

export { ToggleGroup, ToggleGroupItem }
