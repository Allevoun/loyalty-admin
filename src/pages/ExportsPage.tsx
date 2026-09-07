import { PageHeader } from '@/components/PageHeader'
import { useExports, type ExportStatus } from '@/store/exports'
import { fmtDateTime, fmtNumber } from '@/lib/format'
import { Badge, Card, EmptyState, Spinner } from '@/components/ui/misc'
import { Button } from '@/components/ui/Button'

const statusMeta: Record<ExportStatus, { label: string; tone: 'neutral' | 'pos' | 'neg' | 'warn' | 'info' }> = {
  queued: { label: 'В очереди', tone: 'neutral' },
  preparing: { label: 'Формируется', tone: 'info' },
  ready: { label: 'Готово', tone: 'pos' },
  error: { label: 'Ошибка', tone: 'neg' },
  expired: { label: 'Файл недоступен', tone: 'warn' },
}

export function ExportsPage() {
  const { jobs, download, remove, regenerate } = useExports()

  return (
    <div>
      <PageHeader
        title="Экспорты"
        subtitle="Асинхронные выгрузки результатов поиска в XLSX и CSV"
      />

      {jobs.length === 0 ? (
        <EmptyState
          title="Выгрузок пока нет"
          hint="Нажмите «Экспорт» на странице поиска или в карточке — задача появится здесь."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {jobs.map((j) => {
            const m = statusMeta[j.status]
            return (
              <Card key={j.id} className="flex flex-wrap items-center gap-4 p-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-text">{j.title}</span>
                    <Badge tone={m.tone} dot>
                      {m.label}
                    </Badge>
                  </div>
                  <div className="mt-0.5 truncate text-[11.5px] text-text-subtle">
                    {j.summary} · {fmtDateTime(j.createdAt)}
                    {j.status === 'ready' && ` · ${fmtNumber(j.rowCount)} строк`}
                    {j.error && ` · ${j.error}`}
                  </div>
                  {(j.status === 'preparing' || j.status === 'queued') && (
                    <div className="mt-2 h-1 w-full max-w-xs overflow-hidden rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-300"
                        style={{ width: `${Math.max(4, j.progress * 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {(j.status === 'queued' || j.status === 'preparing') && (
                    <Spinner className="text-text-subtle" />
                  )}
                  {j.status === 'ready' && (
                    <Button variant="primary" size="sm" onClick={() => download(j.id)}>
                      Скачать {j.format.toUpperCase()}
                    </Button>
                  )}
                  {(j.status === 'error' || j.status === 'expired') && (
                    <Button variant="default" size="sm" onClick={() => regenerate(j.id)}>
                      Сформировать заново
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => remove(j.id)} aria-label="Удалить">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M4 4l8 8M12 4l-8 8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
