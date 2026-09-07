import { useEffect, useMemo, useState } from 'react'
import type { Direction, OperationFilters } from '@/lib/types'
import type { Sort } from '@/mock/api'
import { usePersistentState } from '@/hooks/usePersistentState'
import { useSavedViews } from '@/store/savedViews'
import { DEFAULT_VISIBLE } from './operationColumns'
import { FilterBar } from './FilterBar'
import { OperationsTable } from './OperationsTable'
import { ColumnMenu } from './ColumnMenu'
import { ExportDialog } from './ExportDialog'
import { Button } from './ui/Button'
import { Tabs, TabsList, TabTrigger } from './ui/Tabs'
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger,
} from './ui/overlays'

const DEFAULT_SORT: Sort = { field: 'createdAt', dir: 'desc' }

export interface ExplorerState {
  filters: OperationFilters
  sort: Sort
  tab: string
}

const TAB_DIR: Record<string, Direction | undefined> = {
  all: undefined,
  accrual: 'accrual',
  redemption: 'redemption',
}

export function OperationsExplorer({
  storageKey,
  baseFilters = {},
  lockUser,
  hideStatus,
  initial,
  onStateChange,
  summaryText,
}: {
  storageKey: string
  baseFilters?: OperationFilters
  lockUser?: boolean
  hideStatus?: boolean
  initial?: Partial<ExplorerState>
  onStateChange?: (s: ExplorerState) => void
  summaryText?: string
}) {
  const [filters, setFilters] = useState<OperationFilters>(initial?.filters ?? {})
  const [sort, setSort] = useState<Sort>(initial?.sort ?? DEFAULT_SORT)
  const [tab, setTab] = useState<string>(initial?.tab ?? 'all')
  const [showFilters, setShowFilters] = useState(
    () => Object.keys(initial?.filters ?? {}).length > 0,
  )
  const [exportOpen, setExportOpen] = useState(false)
  const [columns, setColumns] = usePersistentState<string[]>(
    `la.cols.${storageKey}`,
    DEFAULT_VISIBLE,
  )
  const { views, save, remove } = useSavedViews()

  const merged = useMemo<OperationFilters>(() => {
    const f: OperationFilters = { ...baseFilters, ...filters }
    const dir = TAB_DIR[tab]
    if (dir) f.direction = dir
    return f
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseFilters, filters, tab])

  useEffect(() => {
    onStateChange?.({ filters, sort, tab })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, tab])

  const summary =
    summaryText ??
    (Object.keys(filters).length ? `${Object.keys(filters).length} фильтр(ов), вкладка «${tab}»` : 'без фильтров')

  const relevantViews = views.filter((v) => v.tab === storageKey)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabTrigger value="all">Все операции</TabTrigger>
            <TabTrigger value="accrual">Начисления</TabTrigger>
            <TabTrigger value="redemption">Списания</TabTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? 'subtle' : 'default'}
            size="sm"
            onClick={() => setShowFilters((s) => !s)}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Фильтры
            {Object.keys(filters).length > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-text">
                {Object.keys(filters).length}
              </span>
            )}
          </Button>

          <Dropdown>
            <DropdownTrigger asChild>
              <Button variant="default" size="sm">
                Представления
              </Button>
            </DropdownTrigger>
            <DropdownContent>
              <DropdownLabel>Сохранённые представления</DropdownLabel>
              {relevantViews.length === 0 && (
                <div className="px-2 py-1.5 text-[11.5px] text-text-subtle">Пока нет</div>
              )}
              {relevantViews.map((v) => (
                <DropdownItem
                  key={v.id}
                  onSelect={() => {
                    setFilters(v.filters)
                    setSort(v.sort as Sort)
                    setColumns(v.columns)
                    setShowFilters(Object.keys(v.filters).length > 0)
                  }}
                >
                  <span className="flex-1 truncate">{v.name}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation()
                      remove(v.id)
                    }}
                    className="text-text-subtle hover:text-neg"
                  >
                    ✕
                  </span>
                </DropdownItem>
              ))}
              <DropdownSeparator />
              <DropdownItem
                onSelect={() => {
                  const name = window.prompt('Название представления')
                  if (name)
                    save({ name, tab: storageKey, columns, sort: sort as SavedSort, filters })
                }}
              >
                + Сохранить текущее
              </DropdownItem>
            </DropdownContent>
          </Dropdown>

          <ColumnMenu visible={columns} onChange={setColumns} />

          <Button variant="primary" size="sm" onClick={() => setExportOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2v8m0 0L5 7m3 3l3-3M3 13h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Экспорт
          </Button>
        </div>
      </div>

      {showFilters && (
        <FilterBar value={filters} onApply={setFilters} lockUser={lockUser} hideStatus={hideStatus} />
      )}

      <OperationsTable
        filters={merged}
        sort={sort}
        onSortChange={setSort}
        visibleColumns={columns}
        emptyHint={
          hideStatus
            ? 'Заблокированных операций по заданным условиям нет.'
            : 'Уточните запрос: ID пользователя, рид, номер акции или период.'
        }
      />

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        filters={merged}
        sort={sort}
        summary={summary}
      />
    </div>
  )
}

type SavedSort = { field: string; dir: 'asc' | 'desc' }
