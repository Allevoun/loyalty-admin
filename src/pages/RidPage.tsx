import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getRid } from '@/mock/api'
import { scenarioLabel } from '@/lib/dict'
import { fmtBonus, fmtDate, fmtDateTimeFull, fmtNumber } from '@/lib/format'
import { PageHeader } from '@/components/PageHeader'
import { QueryBoundary } from '@/components/QueryBoundary'
import { CopyId } from '@/components/CopyId'
import {
  DirectionTag,
  PaymentBadge,
  PromoStatusBadge,
  RidStatusBadge,
  StatusBadge,
} from '@/components/badges'
import { Card, CardBody, CardHeader, CardTitle, DList, DRow } from '@/components/ui/misc'

export function RidPage() {
  const { rid = '' } = useParams()
  const decoded = decodeURIComponent(rid)
  const q = useQuery({ queryKey: ['rid', decoded], queryFn: () => getRid(decoded) })

  return (
    <div>
      <PageHeader
        title="Рид (заказ)"
        subtitle={<CopyId value={decoded} display={decoded} />}
        back={{ to: '/search', label: 'К поиску' }}
      />
      <QueryBoundary
        query={q}
        notFoundTitle="Рид не найден"
        notFoundHint="Проверьте полное значение рида — оно многосоставное и чувствительно к точкам."
      >
        {({ rid: r, operations, promos }) => {
          const accrued = operations
            .filter((o) => o.direction === 'accrual' && o.status !== 'blocked')
            .reduce((s, o) => s + o.amount, 0)
          const redeemed = operations
            .filter((o) => o.direction === 'redemption' && o.status !== 'blocked')
            .reduce((s, o) => s + o.amount, 0)
          const blocked = operations.filter((o) => o.status === 'blocked')

          return (
            <div className="flex flex-col gap-5">
              <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>Заказ</CardTitle>
                    <RidStatusBadge status={r.status} />
                  </CardHeader>
                  <CardBody>
                    <DList>
                      <DRow label="Пользователь">
                        <Link
                          to={`/users/${r.userId}`}
                          className="font-mono text-primary hover:underline"
                        >
                          {r.userId}
                        </Link>
                      </DRow>
                      <DRow label="Сумма заказа">{fmtNumber(r.orderAmount)} ₽</DRow>
                      <DRow label="Тип оплаты">
                        <PaymentBadge type={r.paymentType} eligible={r.bonusEligible} />
                      </DRow>
                      <DRow label="Бонусная логика">
                        {r.bonusEligible ? (
                          <span className="text-pos">активна</span>
                        ) : (
                          <span className="text-neg">
                            заблокирована — оплата не картой внутреннего банка
                          </span>
                        )}
                      </DRow>
                      <DRow label="Покупка">{fmtDate(r.purchasedAt)}</DRow>
                      <DRow label="Выкуп">{r.redeemedAt ? fmtDate(r.redeemedAt) : '—'}</DRow>
                    </DList>
                    <Link
                      to={`/users/${r.userId}?t=operations`}
                      className="mt-4 inline-flex h-7 items-center rounded-[var(--radius-sm)] border border-border-strong bg-surface px-2.5 text-[12px] font-medium text-text hover:bg-surface-2"
                    >
                      Все операции пользователя
                    </Link>
                  </CardBody>
                </Card>

                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Card className="p-3">
                      <div className="text-[11px] uppercase tracking-wide text-text-subtle">
                        Начислено
                      </div>
                      <div className="mt-1 text-[18px] font-semibold tabular-nums text-pos">
                        +{fmtNumber(accrued)}
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="text-[11px] uppercase tracking-wide text-text-subtle">
                        Списано
                      </div>
                      <div className="mt-1 text-[18px] font-semibold tabular-nums text-neg">
                        −{fmtNumber(redeemed)}
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="text-[11px] uppercase tracking-wide text-text-subtle">
                        Заблокировано
                      </div>
                      <div className="mt-1 text-[18px] font-semibold tabular-nums text-text-muted">
                        {blocked.length}
                      </div>
                    </Card>
                  </div>

                  {promos.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Акции по риду</CardTitle>
                      </CardHeader>
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
                    </Card>
                  )}
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Операции по риду</CardTitle>
                  <span className="text-[11.5px] text-text-muted">{operations.length}</span>
                </CardHeader>
                {operations.length === 0 ? (
                  <CardBody>
                    <span className="text-[12px] text-text-subtle">Операций нет</span>
                  </CardBody>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[12.5px]">
                      <thead className="text-[11px] uppercase tracking-wide text-text-subtle">
                        <tr className="border-b border-border">
                          <th className="px-4 py-2 text-left font-medium">Дата</th>
                          <th className="px-4 py-2 text-left font-medium">Тип</th>
                          <th className="px-4 py-2 text-left font-medium">Причина</th>
                          <th className="px-4 py-2 text-left font-medium">Статус</th>
                          <th className="px-4 py-2 text-right font-medium">Бонусы</th>
                          <th className="px-4 py-2 text-left font-medium">ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {operations.map((o) => (
                          <tr key={o.id} className="border-b border-border/60 hover:bg-surface-2/50">
                            <td className="px-4 py-2 tabular-nums text-text-muted">
                              {fmtDateTimeFull(o.createdAt)}
                            </td>
                            <td className="px-4 py-2">
                              <DirectionTag direction={o.direction} />
                            </td>
                            <td className="px-4 py-2">
                              <div>{o.reasonLabel}</div>
                              <div className="text-[11px] text-text-subtle">
                                {o.scenario ? scenarioLabel[o.scenario] : 'списание'}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <StatusBadge status={o.status} />
                            </td>
                            <td
                              className={
                                'px-4 py-2 text-right font-semibold tabular-nums ' +
                                (o.direction === 'accrual' ? 'text-pos' : 'text-neg')
                              }
                            >
                              {fmtBonus(o.amount, o.direction)}
                            </td>
                            <td className="px-4 py-2">
                              <Link to={`/operations/${o.id}`}>
                                <CopyId
                                  value={o.id}
                                  display={
                                    <span className="text-primary hover:underline">{o.shortId}</span>
                                  }
                                />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )
        }}
      </QueryBoundary>
    </div>
  )
}
