import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSegment } from '@/mock/api'
import { fmtDate, fmtNumber } from '@/lib/format'
import { PageHeader } from '@/components/PageHeader'
import { QueryBoundary } from '@/components/QueryBoundary'
import { OperationsExplorer } from '@/components/OperationsExplorer'
import { PromoStatusBadge } from '@/components/badges'
import { Card, CardBody, CardHeader, CardTitle, EmptyState, Stat } from '@/components/ui/misc'

export function SegmentPage() {
  const { id } = useParams()
  const segmentId = Number(id)
  const q = useQuery({ queryKey: ['segment', segmentId], queryFn: () => getSegment(segmentId) })

  return (
    <div>
      <PageHeader title={`Сегмент #${segmentId}`} back={{ to: '/segments', label: 'К списку сегментов' }} />
      <QueryBoundary query={q} notFoundTitle="Сегмент не найден">
        {({ segment, members, promos }) => (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-[16px] font-semibold text-text">{segment.name}</h2>
              <p className="mt-0.5 text-[12.5px] text-text-muted">{segment.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Пользователей" value={fmtNumber(segment.usersCount)} />
              <Stat label="Связанных акций" value={promos.length} />
              <Stat
                label="Начислено по сегменту"
                value={fmtNumber(members.reduce((s, m) => s + m.accrued, 0))}
                tone="pos"
              />
              <Stat label="Создан" value={fmtDate(segment.createdAt)} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Связанные поведенческие акции</CardTitle>
              </CardHeader>
              {promos.length === 0 ? (
                <EmptyState title="Нет акций, привязанных к сегменту" />
              ) : (
                <CardBody className="flex flex-col gap-2">
                  {promos.map((p) => (
                    <Link
                      key={p.id}
                      to={`/promos/${p.id}`}
                      className="flex items-center justify-between rounded-[var(--radius-md)] border border-border px-3 py-2 hover:border-primary"
                    >
                      <span className="text-[12.5px]">
                        #{p.id} {p.name}
                      </span>
                      <PromoStatusBadge status={p.status} />
                    </Link>
                  ))}
                </CardBody>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Состав сегмента</CardTitle>
                <span className="text-[11.5px] text-text-muted">{members.length}</span>
              </CardHeader>
              <div className="scroll-thin max-h-[420px] overflow-auto">
                <table className="w-full text-[12.5px]">
                  <thead className="sticky top-0 bg-surface-2 text-[11px] uppercase tracking-wide text-text-subtle">
                    <tr className="border-b border-border">
                      <th className="px-4 py-2 text-left font-medium">Пользователь</th>
                      <th className="px-4 py-2 text-left font-medium">В сегменте с</th>
                      <th className="px-4 py-2 text-right font-medium">Операций по сегменту</th>
                      <th className="px-4 py-2 text-right font-medium">Начислено</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.userId} className="border-b border-border/60 hover:bg-surface-2/50">
                        <td className="px-4 py-2">
                          <Link
                            to={`/users/${m.userId}`}
                            className="font-mono text-[11.5px] text-primary hover:underline"
                          >
                            {m.userId}
                          </Link>
                        </td>
                        <td className="px-4 py-2 tabular-nums text-text-muted">{fmtDate(m.joinedAt)}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-text-muted">
                          {m.operations}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold tabular-nums text-pos">
                          {m.accrued ? `+${fmtNumber(m.accrued)}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div>
              <h3 className="mb-3 text-[13px] font-semibold text-text">Операции по сегменту</h3>
              <OperationsExplorer
                storageKey="segment-ops"
                baseFilters={{ segmentId }}
                summaryText={`сегмент #${segmentId}`}
              />
            </div>
          </div>
        )}
      </QueryBoundary>
    </div>
  )
}
