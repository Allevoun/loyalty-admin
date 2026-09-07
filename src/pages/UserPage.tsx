import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getUserOverview } from '@/mock/api'
import { fmtDate, fmtDateTime, fmtNumber, relTime, shortRid } from '@/lib/format'
import { PageHeader } from '@/components/PageHeader'
import { QueryBoundary } from '@/components/QueryBoundary'
import { OperationsExplorer } from '@/components/OperationsExplorer'
import { CopyId } from '@/components/CopyId'
import { PromoStatusBadge, PromoSubtypeBadge, RidStatusBadge } from '@/components/badges'
import { Card, CardBody, CardHeader, CardTitle, EmptyState, Stat } from '@/components/ui/misc'
import { Tabs, TabsList, TabTrigger, TabContent } from '@/components/ui/Tabs'

export function UserPage() {
  const { id } = useParams()
  const userId = Number(id)
  const [params, setParams] = useSearchParams()
  const tab = params.get('t') ?? 'operations'
  const setTab = (t: string) => {
    const n = new URLSearchParams(params)
    n.set('t', t)
    setParams(n, { replace: true })
  }

  const q = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserOverview(userId),
  })

  return (
    <div>
      <PageHeader
        title={<span className="font-mono">Пользователь {userId}</span>}
        subtitle={<CopyId value={userId} display={`ID ${userId}`} />}
        back={{ to: '/user', label: 'К поиску пользователя' }}
      />

      <QueryBoundary query={q} notFoundTitle="Пользователь не найден">
        {(data) => {
          if (!data.exists) {
            return (
              <EmptyState
                title={`По пользователю ${userId} нет данных`}
                hint="Операции, акции и сегменты не найдены. Проверьте ID."
              />
            )
          }
          const b = data.balance
          return (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                <Stat label="Доступно" value={b ? fmtNumber(b.available) : '—'} tone="pos" />
                <Stat label="В ожидании" value={b ? fmtNumber(b.pending) : '—'} tone="warn" />
                <Stat
                  label="Сгорело всего"
                  value={b ? fmtNumber(b.expiredTotal) : '—'}
                />
                <Stat label="Отозвано всего" value={b ? fmtNumber(b.clawedBackTotal) : '—'} tone="neg" />
                <Stat
                  label="Ближайшее сгорание"
                  value={b?.nextExpiry ? fmtNumber(b.nextExpiry.amount) : '—'}
                  sub={b?.nextExpiry ? fmtDate(b.nextExpiry.date) : 'нет'}
                />
                <Stat
                  label="Активность"
                  value={data.counts.operations}
                  sub={b ? `последняя ${relTime(b.lastActivityAt)}` : undefined}
                />
              </div>

              <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
                  <TabTrigger value="operations" count={data.counts.operations}>
                    Операции
                  </TabTrigger>
                  <TabTrigger value="promos" count={data.counts.promos}>
                    Акции
                  </TabTrigger>
                  <TabTrigger value="segments" count={data.counts.segments}>
                    Сегменты
                  </TabTrigger>
                  <TabTrigger value="rids" count={data.counts.rids}>
                    Риды
                  </TabTrigger>
                </TabsList>

                <div className="pt-4">
                  <TabContent value="operations">
                    <OperationsExplorer
                      storageKey="user-ops"
                      baseFilters={{ userId }}
                      lockUser
                      summaryText={`пользователь ${userId}`}
                    />
                  </TabContent>

                  <TabContent value="promos">
                    <Card>
                      <CardHeader>
                        <CardTitle>Акции пользователя</CardTitle>
                        <span className="text-[11.5px] text-text-muted">{data.promos.length}</span>
                      </CardHeader>
                      {data.promos.length === 0 ? (
                        <EmptyState title="Пользователь не участвовал в акциях" />
                      ) : (
                        <table className="w-full text-[12.5px]">
                          <thead className="text-[11px] uppercase tracking-wide text-text-subtle">
                            <tr className="border-b border-border">
                              <th className="px-4 py-2 text-left font-medium">Акция</th>
                              <th className="px-4 py-2 text-left font-medium">Тип</th>
                              <th className="px-4 py-2 text-left font-medium">Статус</th>
                              <th className="px-4 py-2 text-right font-medium">Начислено</th>
                              <th className="px-4 py-2 text-right font-medium">Операций</th>
                              <th className="px-4 py-2 text-left font-medium">Последняя</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.promos.map((p) => (
                              <tr key={p.promo.id} className="border-b border-border/60 hover:bg-surface-2/50">
                                <td className="px-4 py-2">
                                  <Link to={`/promos/${p.promo.id}`} className="text-primary hover:underline">
                                    #{p.promo.id} {p.promo.name}
                                  </Link>
                                </td>
                                <td className="px-4 py-2">
                                  <PromoSubtypeBadge subtype={p.promo.subtype} />
                                </td>
                                <td className="px-4 py-2">
                                  <PromoStatusBadge status={p.promo.status} />
                                </td>
                                <td className="px-4 py-2 text-right font-semibold tabular-nums text-pos">
                                  +{fmtNumber(p.accrued)}
                                </td>
                                <td className="px-4 py-2 text-right tabular-nums text-text-muted">
                                  {p.operations}
                                </td>
                                <td className="px-4 py-2 tabular-nums text-text-muted">
                                  {fmtDateTime(p.lastAt)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </Card>
                  </TabContent>

                  <TabContent value="segments">
                    <Card>
                      <CardHeader>
                        <CardTitle>Сегменты пользователя</CardTitle>
                        <span className="text-[11.5px] text-text-muted">{data.segments.length}</span>
                      </CardHeader>
                      {data.segments.length === 0 ? (
                        <EmptyState title="Пользователь не входит в сегменты" />
                      ) : (
                        <CardBody className="flex flex-col gap-2">
                          {data.segments.map((s) => (
                            <Link
                              key={s.segment.id}
                              to={`/segments/${s.segment.id}`}
                              className="flex items-center justify-between rounded-[var(--radius-md)] border border-border px-3 py-2 hover:border-primary"
                            >
                              <span className="text-[12.5px] text-text">
                                #{s.segment.id} {s.segment.name}
                              </span>
                              <span className="text-[11.5px] text-text-muted">
                                в сегменте с {fmtDate(s.joinedAt)}
                              </span>
                            </Link>
                          ))}
                        </CardBody>
                      )}
                    </Card>
                  </TabContent>

                  <TabContent value="rids">
                    <Card>
                      <CardHeader>
                        <CardTitle>Риды пользователя</CardTitle>
                        <span className="text-[11.5px] text-text-muted">{data.rids.length}</span>
                      </CardHeader>
                      {data.rids.length === 0 ? (
                        <EmptyState title="Заказов нет" />
                      ) : (
                        <div className="scroll-thin max-h-[560px] overflow-auto">
                          <table className="w-full text-[12.5px]">
                            <thead className="sticky top-0 bg-surface-2 text-[11px] uppercase tracking-wide text-text-subtle">
                              <tr className="border-b border-border">
                                <th className="px-4 py-2 text-left font-medium">Рид</th>
                                <th className="px-4 py-2 text-left font-medium">Покупка</th>
                                <th className="px-4 py-2 text-right font-medium">Сумма заказа</th>
                                <th className="px-4 py-2 text-left font-medium">Оплата</th>
                                <th className="px-4 py-2 text-left font-medium">Статус</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.rids.map((r) => (
                                <tr key={r.rid} className="border-b border-border/60 hover:bg-surface-2/50">
                                  <td className="px-4 py-2">
                                    <Link
                                      to={`/rids/${encodeURIComponent(r.rid)}`}
                                      className="font-mono text-[11.5px] text-primary hover:underline"
                                    >
                                      {shortRid(r.rid)}
                                    </Link>
                                  </td>
                                  <td className="px-4 py-2 tabular-nums text-text-muted">
                                    {fmtDate(r.purchasedAt)}
                                  </td>
                                  <td className="px-4 py-2 text-right tabular-nums">
                                    {fmtNumber(r.orderAmount)} ₽
                                  </td>
                                  <td className="px-4 py-2">
                                    {r.paymentType === 'true_bank' ? (
                                      <span className="text-pos">внутренний банк</span>
                                    ) : (
                                      <span className="text-warn">сторонняя оплата</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2">
                                    <RidStatusBadge status={r.status} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </Card>
                  </TabContent>
                </div>
              </Tabs>
            </div>
          )
        }}
      </QueryBoundary>
    </div>
  )
}
