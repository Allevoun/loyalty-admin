import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { OperationFilters } from '@/lib/types'
import { countOperations, type Sort } from '@/mock/api'
import { EXPORT_COLUMNS } from '@/lib/exportRows'
import { fmtNumber } from '@/lib/format'
import { useExports, type ExportFormat } from '@/store/exports'
import { Button } from './ui/Button'
import { Dialog } from './ui/overlays'

export function ExportDialog({
  open,
  onOpenChange,
  filters,
  sort,
  summary,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  filters: OperationFilters
  sort: Sort
  summary: string
}) {
  const [format, setFormat] = useState<ExportFormat>('xlsx')
  const { enqueue } = useExports()
  const navigate = useNavigate()

  const { data: count, isLoading } = useQuery({
    queryKey: ['count', filters],
    queryFn: () => countOperations(filters),
    enabled: open,
  })

  const tooBig = (count ?? 0) > 1_000_000

  const start = () => {
    enqueue({
      title: `Операции · ${format.toUpperCase()}`,
      summary,
      format,
      filters,
      sort,
    })
    onOpenChange(false)
    navigate('/exports')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Экспорт результатов"
      description="Выгрузка формируется асинхронно. Готовый файл появится в разделе «Экспорты»."
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button variant="primary" size="sm" onClick={start} disabled={tooBig || isLoading}>
            Сформировать выгрузку
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 text-[11.5px] font-medium text-text-muted">Формат</div>
          <div className="flex gap-2">
            {(['xlsx', 'csv'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={
                  'flex-1 rounded-[var(--radius-md)] border px-3 py-2 text-left text-[12.5px] transition-colors ' +
                  (format === f
                    ? 'border-primary bg-primary-weak text-text'
                    : 'border-border-strong bg-surface text-text-muted hover:bg-surface-2')
                }
              >
                <div className="font-semibold uppercase">{f}</div>
                <div className="text-[11px] text-text-subtle">
                  {f === 'xlsx' ? 'Excel, один лист «Операции»' : 'CSV, разделитель «;», UTF-8'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[12px]">
          <dt className="text-text-muted">Строк к выгрузке</dt>
          <dd className="font-semibold tabular-nums text-text">
            {isLoading ? '…' : fmtNumber(count ?? 0)}
          </dd>
          <dt className="text-text-muted">Колонок</dt>
          <dd className="text-text">{EXPORT_COLUMNS.length} — полный денормализованный набор</dd>
          <dt className="text-text-muted">Фильтры</dt>
          <dd className="text-text">{summary}</dd>
        </dl>

        {tooBig && (
          <div className="rounded-[var(--radius-md)] bg-neg-weak px-3 py-2 text-[11.5px] text-neg">
            Больше 1 000 000 строк — сузьте период или добавьте фильтры.
          </div>
        )}
      </div>
    </Dialog>
  )
}
