import { useCallback, useEffect, useState } from 'react'
import type { OperationFilters, SortDir } from '@/lib/types'

export interface SavedView {
  id: string
  name: string
  tab: string
  columns: string[] // visible column ids, in order
  sort: { field: string; dir: SortDir }
  filters: OperationFilters
  createdAt: string
}

const KEY = 'la.views'

function read(): SavedView[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SavedView[]) : []
  } catch {
    return []
  }
}

export function useSavedViews() {
  const [views, setViews] = useState<SavedView[]>(read)

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setViews(read())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const persist = useCallback((next: SavedView[]) => {
    setViews(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }, [])

  const save = useCallback(
    (v: Omit<SavedView, 'id' | 'createdAt'>) => {
      const view: SavedView = {
        ...v,
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
      }
      persist([view, ...read()])
      return view.id
    },
    [persist],
  )

  const remove = useCallback((id: string) => persist(read().filter((v) => v.id !== id)), [persist])

  return { views, save, remove }
}
