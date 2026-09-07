import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { smartMatch } from '@/mock/api'
import type { SmartMatch, SmartMatchKind } from '@/lib/types'
import { useDebounced } from '@/hooks/useDebounced'
import { cn } from '@/lib/cn'
import { Spinner } from './ui/misc'

const RECENTS_KEY = 'la.recentSearch'

const kindLabel: Record<SmartMatchKind, string> = {
  user: 'Пользователь',
  operation: 'Операция',
  rid: 'Рид',
  promo: 'Акция',
  segment: 'Сегмент',
  manual_batch: 'Батч',
  unknown: '—',
}

function readRecents(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}
function pushRecent(q: string) {
  const next = [q, ...readRecents().filter((r) => r !== q)].slice(0, 6)
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

export function SmartSearch({
  variant = 'full',
  autoFocus,
}: {
  variant?: 'full' | 'compact'
  autoFocus?: boolean
}) {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const debounced = useDebounced(value.trim(), 220)
  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: matches = [], isFetching } = useQuery({
    queryKey: ['smart', debounced],
    queryFn: () => smartMatch(debounced),
    enabled: debounced.length >= 2,
  })

  const recents = useMemo(readRecents, [open])

  useEffect(() => setActive(0), [debounced])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  useEffect(() => {
    if (variant !== 'compact') return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [variant])

  const go = (to: string, q: string) => {
    pushRecent(q)
    setOpen(false)
    setValue('')
    navigate(to)
  }

  const submitFreeText = () => {
    const q = value.trim()
    if (!q) return
    if (matches[active]) {
      go(matches[active].to, q)
      return
    }
    pushRecent(q)
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, matches.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      submitFreeText()
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showPanel = open && (debounced.length >= 2 || recents.length > 0)

  return (
    <div
      ref={boxRef}
      className={cn('relative', variant === 'full' ? 'w-full' : 'w-full max-w-md')}
    >
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={
            variant === 'full'
              ? 'ID пользователя, рид, ID операции (uuid), номер акции или сегмента, название…'
              : 'Быстрый поиск…'
          }
          className={cn(
            'w-full rounded-[var(--radius-md)] border border-border-strong bg-surface pl-9 pr-16 text-text placeholder:text-text-subtle',
            'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent',
            variant === 'full' ? 'h-11 text-[14px]' : 'h-8 text-[12.5px]',
          )}
        />
        <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {isFetching && <Spinner className="text-text-subtle" />}
          {variant === 'compact' && !value && (
            <kbd className="rounded border border-border-strong bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-text-subtle">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {showPanel && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-[var(--radius-lg)] border border-border-strong bg-surface shadow-[var(--shadow-lg)] animate-in">
          {debounced.length >= 2 ? (
            matches.length > 0 ? (
              <ul className="max-h-[340px] overflow-auto py-1">
                {matches.map((m: SmartMatch, i) => (
                  <li key={`${m.kind}-${m.to}-${i}`}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(m.to, value.trim())}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2 text-left',
                        i === active && 'bg-surface-2',
                      )}
                    >
                      <span className="w-[86px] shrink-0 text-[10.5px] font-medium uppercase tracking-wide text-text-subtle">
                        {kindLabel[m.kind]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] text-text">{m.label}</span>
                        <span className="block truncate text-[11px] text-text-subtle">{m.hint}</span>
                      </span>
                      <span className="text-text-subtle">↵</span>
                    </button>
                  </li>
                ))}
                <li className="border-t border-border">
                  <button
                    type="button"
                    onClick={submitFreeText}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-text-muted hover:bg-surface-2"
                  >
                    <span className="text-text-subtle">→</span> Искать «{value.trim()}» во всех операциях
                  </button>
                </li>
              </ul>
            ) : isFetching ? (
              <div className="px-3 py-6 text-center text-[12px] text-text-muted">Поиск…</div>
            ) : (
              <div className="px-3 py-2">
                <button
                  type="button"
                  onClick={submitFreeText}
                  className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-[12px] text-text-muted hover:bg-surface-2"
                >
                  <span className="text-text-subtle">→</span> Прямых совпадений нет — искать «
                  {value.trim()}» во всех операциях
                </button>
              </div>
            )
          ) : (
            <div className="py-1">
              <div className="px-3 py-1.5 text-[10.5px] font-medium uppercase tracking-wide text-text-subtle">
                Недавние запросы
              </div>
              {recents.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setValue(r)
                    setOpen(true)
                    inputRef.current?.focus()
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-text-muted hover:bg-surface-2"
                >
                  <span className="text-text-subtle">↻</span>
                  <span className="truncate font-mono text-[11.5px]">{r}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
