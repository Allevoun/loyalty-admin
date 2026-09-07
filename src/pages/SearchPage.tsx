import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { OperationFilters } from '@/lib/types'
import type { Sort } from '@/mock/api'
import { PageHeader } from '@/components/PageHeader'
import { SmartSearch } from '@/components/SmartSearch'
import { OperationsExplorer, type ExplorerState } from '@/components/OperationsExplorer'
import { Card } from '@/components/ui/misc'

function detectFilters(q: string): OperationFilters {
  const s = q.trim()
  if (!s) return {}
  if (/^\d{4,12}$/.test(s)) return { userId: Number(s) }
  if (s.includes('.') && s.split('.').length >= 6) return { rid: s }
  return { search: s }
}

function parseSort(raw: string | null): Sort | undefined {
  if (!raw) return undefined
  const [field, dir] = raw.split(':')
  if (!field) return undefined
  return { field: field as Sort['field'], dir: dir === 'asc' ? 'asc' : 'desc' }
}

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''

  const initial = useMemo<Partial<ExplorerState>>(() => {
    let filters: OperationFilters = {}
    const f = params.get('f')
    if (f) {
      try {
        filters = JSON.parse(decodeURIComponent(f)) as OperationFilters
      } catch {
        /* ignore */
      }
    } else if (q) {
      filters = detectFilters(q)
    }
    return {
      filters,
      sort: parseSort(params.get('sort')),
      tab: params.get('tab') ?? 'all',
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Explorer remounts only when a fresh search arrives (q changes); its own
  // writes update f/sort/tab but leave q untouched, so no remount loop.
  const explorerKey = q || 'base'

  const onStateChange = useCallback(
    (s: ExplorerState) => {
      const next = new URLSearchParams(params)
      if (Object.keys(s.filters).length) next.set('f', encodeURIComponent(JSON.stringify(s.filters)))
      else next.delete('f')
      next.set('sort', `${s.sort.field}:${s.sort.dir}`)
      next.set('tab', s.tab)
      setParams(next, { replace: true })
    },
    [params, setParams],
  )

  return (
    <div>
      <PageHeader
        title="Поиск"
        subtitle="Начисления, списания и акции по пользователю, риду, акции или сегменту"
      />

      <Card className="mb-5 p-4">
        <SmartSearch variant="full" autoFocus />
        <p className="mt-2 text-[11.5px] text-text-subtle">
          Введите точное значение для перехода к карточке, либо любой текст — чтобы найти операции.
          Ниже — расширенный поиск с фильтрами по всем полям.
        </p>
      </Card>

      <OperationsExplorer
        key={explorerKey}
        storageKey="search"
        initial={initial}
        onStateChange={onStateChange}
      />
    </div>
  )
}
