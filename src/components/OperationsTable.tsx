import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { OperationFilters } from '@/lib/types'
import { searchOperations, type Sort } from '@/mock/api'
import { cn } from '@/lib/cn'
import { fmtNumber } from '@/lib/format'
import { OP_COLUMNS } from './operationColumns'
import { EmptyState, Spinner } from './ui/misc'

const PAGE = 50
const ROW_H = 46

export function OperationsTable({
  filters,
  sort,
  onSortChange,
  visibleColumns,
  emptyHint,
  maxHeight = 620,
}: {
  filters: OperationFilters
  sort: Sort
  onSortChange: (s: Sort) => void
  visibleColumns: string[]
  emptyHint?: string
  maxHeight?: number
}) {
  const navigate = useNavigate()
  const cols = useMemo(
    () =>
      visibleColumns
        .map((id) => OP_COLUMNS.find((c) => c.id === id))
        .filter((c): c is (typeof OP_COLUMNS)[number] => !!c),
    [visibleColumns],
  )

  const q = useInfiniteQuery({
    queryKey: ['operations', filters, sort],
    queryFn: ({ pageParam }) =>
      searchOperations(filters, sort, pageParam as string | null, PAGE),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  })

  const rows = useMemo(() => q.data?.pages.flatMap((p) => p.rows) ?? [], [q.data])
  const total = q.data?.pages[0]?.total ?? 0

  const parentRef = useRef<HTMLDivElement>(null)
  const virt = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_H,
    overscan: 14,
  })
  const items = virt.getVirtualItems()
  const lastIndex = items.length ? items[items.length - 1].index : 0
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = q

  useEffect(() => {
    if (lastIndex >= rows.length - 12 && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [lastIndex, rows.length, hasNextPage, isFetchingNextPage, fetchNextPage])

  const gridTemplate = cols.map((c) => `${c.width}px`).join(' ') + ' minmax(16px,1fr)'

  const toggleSort = (id: string) => {
    const col = OP_COLUMNS.find((c) => c.id === id)
    if (!col?.sortable) return
    if (sort.field === id) onSortChange({ field: sort.field, dir: sort.dir === 'asc' ? 'desc' : 'asc' })
    else onSortChange({ field: id as Sort['field'], dir: 'desc' })
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-2/40 px-3 py-1.5 text-[11.5px] text-text-muted">
        <span>
          {q.isLoading ? (
            'Загрузка…'
          ) : (
            <>
              Найдено{' '}
              <span className="font-semibold text-text tabular-nums">{fmtNumber(total)}</span> · загружено{' '}
              {fmtNumber(rows.length)}
            </>
          )}
        </span>
        {q.isFetching && !q.isLoading && <Spinner className="text-text-subtle" />}
      </div>

      <div
        ref={parentRef}
        className="scroll-thin overflow-auto"
        style={{ maxHeight }}
      >
        <div style={{ minWidth: cols.reduce((s, c) => s + c.width, 40) }}>
          {/* header */}
          <div
            className="sticky top-0 z-10 grid border-b border-border bg-surface-2 text-[11px] font-medium uppercase tracking-wide text-text-subtle"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {cols.map((c) => {
              const active = sort.field === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleSort(c.id)}
                  className={cn(
                    'flex h-9 items-center gap-1 px-3 text-left',
                    c.align === 'right' && 'justify-end text-right',
                    c.sortable ? 'cursor-pointer hover:text-text' : 'cursor-default',
                    active && 'text-text',
                  )}
                >
                  <span className="truncate">{c.header}</span>
                  {c.sortable && (
                    <span className={cn('text-[9px]', !active && 'opacity-30')}>
                      {active ? (sort.dir === 'asc' ? '▲' : '▼') : '▼'}
                    </span>
                  )}
                </button>
              )
            })}
            <div />
          </div>

          {/* body */}
          {q.isLoading ? (
            <div className="p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="mb-2 h-8 animate-pulse rounded bg-surface-3" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState title="Ничего не найдено" hint={emptyHint ?? 'Измените параметры поиска или фильтры.'} />
          ) : (
            <div style={{ height: virt.getTotalSize(), position: 'relative' }}>
              {items.map((vi) => {
                const op = rows[vi.index]
                return (
                  <div
                    key={op.id}
                    onClick={() => navigate(`/operations/${op.id}`)}
                    className="absolute left-0 grid w-full cursor-pointer items-center border-b border-border/60 text-[12.5px] hover:bg-primary-weak/40"
                    style={{
                      transform: `translateY(${vi.start}px)`,
                      height: vi.size,
                      gridTemplateColumns: gridTemplate,
                    }}
                  >
                    {cols.map((c) => (
                      <div
                        key={c.id}
                        className={cn(
                          'min-w-0 truncate px-3',
                          c.align === 'right' && 'text-right',
                        )}
                      >
                        {c.cell(op)}
                      </div>
                    ))}
                    <div />
                  </div>
                )
              })}
            </div>
          )}

          {q.isFetchingNextPage && (
            <div className="flex items-center justify-center gap-2 py-3 text-[11.5px] text-text-muted">
              <Spinner /> Загрузка ещё…
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
