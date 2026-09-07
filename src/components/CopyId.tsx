import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Tooltip } from './ui/overlays'

export function CopyId({
  value,
  display,
  className,
  mono = true,
}: {
  value: string | number
  display?: ReactNode
  className?: string
  mono?: boolean
}) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(value))
      setDone(true)
      setTimeout(() => setDone(false), 1200)
    } catch {
      /* ignore */
    }
  }
  return (
    <Tooltip content={done ? 'Скопировано' : String(value)}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          void copy()
        }}
        className={cn(
          'group inline-flex max-w-full items-center gap-1 rounded px-1 -mx-1 text-left hover:bg-surface-2',
          mono && 'font-mono text-[11.5px]',
          className,
        )}
      >
        <span className="truncate">{display ?? String(value)}</span>
        <svg
          className={cn(
            'h-3 w-3 shrink-0 text-text-subtle opacity-0 transition-opacity group-hover:opacity-100',
            done && 'opacity-100 text-pos',
          )}
          viewBox="0 0 16 16"
          fill="none"
        >
          {done ? (
            <path
              d="M3.5 8.5l3 3 6-7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <>
              <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M10.5 5.5V4A1.5 1.5 0 009 2.5H4A1.5 1.5 0 002.5 4v5A1.5 1.5 0 004 10.5h1.5" stroke="currentColor" strokeWidth="1.3" />
            </>
          )}
        </svg>
      </button>
    </Tooltip>
  )
}
