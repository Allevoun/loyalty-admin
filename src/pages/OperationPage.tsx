import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOperation } from '@/mock/api'
import { reasonLabel, scenarioLabel } from '@/lib/dict'
import { fmtBonus, fmtDateTimeFull, fmtNumber } from '@/lib/format'
import { PageHeader } from '@/components/PageHeader'
import { QueryBoundary } from '@/components/QueryBoundary'
import { CopyId } from '@/components/CopyId'
import {
  DirectionTag,
  LifecycleBadge,
  PaymentBadge,
  PromoSubtypeBadge,
  StatusBadge,
} from '@/components/badges'
import { Card, CardBody, CardHeader, CardTitle, DList, DRow } from '@/components/ui/misc'

export function OperationPage() {
  const { id = '' } = useParams()
  const q = useQuery({ queryKey: ['operation', id], queryFn: () => getOperation(id) })

  return (
    <div>
      <PageHeader
        title="Операция"
        subtitle={<CopyId value={id} />}
        back={{ to: '/search', label: 'К поиску' }}
      />
      <QueryBoundary query={q} notFoundTitle="Операция не найдена" notFoundHint="Проверьте UUID операции.">
        {({ operation: op, related, rid, promo, batch }) => (
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DirectionTag direction={op.direction} />
                  <StatusBadge status={op.status} />
                  <LifecycleBadge lifecycle={op.lifecycle} />
                </div>
                <span
                  className={
                    'text-[20px] font-semibold tabular-nums ' +
                    (op.direction === 'accrual' ? 'text-pos' : 'text-neg')
                  }
                >
                  {fmtBonus(op.amount, op.direction)}
                </span>
              </CardHeader>
              <CardBody>
                <DList>
                  <DRow label="Причина">
                    {op.reasonLabel}
                    <span className="ml-1 text-text-subtle">({reasonLabel[op.reason]})</span>
                  </DRow>
                  <DRow label="Сценарий">
                    {op.scenario ? scenarioLabel[op.scenario] : 'списание'}
                    {op.promoSubtype && (
                      <span className="ml-2">
                        <PromoSubtypeBadge subtype={op.promoSubtype} />
                      </span>
                    )}
                  </DRow>
                  <DRow label="Дата события">{fmtDateTimeFull(op.createdAt)}</DRow>
                  {op.effectiveAt && (
                    <DRow label="Факт. начисление">{fmtDateTimeFull(op.effectiveAt)}</DRow>
                  )}
                  {op.expiresAt && <DRow label="Дата сгорания">{fmtDateTimeFull(op.expiresAt)}</DRow>}
                  <DRow label="Пользователь">
                    <Link to={`/users/${op.userId}`} className="font-mono text-primary hover:underline">
                      {op.userId}
                    </Link>
                  </DRow>
                  <DRow label="Тип оплаты">
                    <PaymentBadge type={op.paymentType} eligible={op.bonusEligible} />
                  </DRow>
                  <DRow label="Бонусы разрешены">{op.bonusEligible ? 'да' : 'нет'}</DRow>
                  <DRow label="ID операции">
                    <CopyId value={op.id} />
                  </DRow>
                  {op.idempotencyKey && (
                    <DRow label="Idempotency key">
                      <CopyId value={op.idempotencyKey} />
                    </DRow>
                  )}
                  {op.sourceSystem && <DRow label="Внешняя система">{op.sourceSystem}</DRow>}
                </DList>
              </CardBody>
            </Card>

            <div className="flex flex-col gap-4">
              {rid && (
                <Card>
                  <CardHeader>
                    <CardTitle>Рид</CardTitle>
                  </CardHeader>
                  <CardBody className="text-[12.5px]">
                    <Link
                      to={`/rids/${encodeURIComponent(rid.rid)}`}
                      className="break-all font-mono text-[11.5px] text-primary hover:underline"
                    >
                      {rid.rid}
                    </Link>
                    <div className="mt-2 text-text-muted">
                      Заказ на {fmtNumber(rid.orderAmount)} ₽ · статус {rid.status}
                    </div>
                  </CardBody>
                </Card>
              )}

              {promo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Акция</CardTitle>
                  </CardHeader>
                  <CardBody className="text-[12.5px]">
                    <Link to={`/promos/${promo.id}`} className="text-primary hover:underline">
                      #{promo.id} {promo.name}
                    </Link>
                    <p className="mt-1 text-text-muted">{promo.condition.description}</p>
                    {op.segmentId != null && (
                      <p className="mt-1">
                        Сегмент:{' '}
                        <Link to={`/segments/${op.segmentId}`} className="text-primary hover:underline">
                          #{op.segmentId} {op.segmentName}
                        </Link>
                      </p>
                    )}
                  </CardBody>
                </Card>
              )}

              {batch && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ручное начисление</CardTitle>
                  </CardHeader>
                  <CardBody className="text-[12.5px]">
                    <Link to={`/batches/${batch.id}`} className="text-primary hover:underline">
                      Батч · {batch.reason}
                    </Link>
                    <div className="mt-1 text-text-muted">
                      Автор {batch.author} · {fmtNumber(batch.usersCount)} польз. · файл{' '}
                      {batch.sourceFileName}
                    </div>
                  </CardBody>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Связанные операции</CardTitle>
                  <span className="text-[11.5px] text-text-muted">{related.length}</span>
                </CardHeader>
                <CardBody className="flex flex-col gap-2">
                  {related.length === 0 && (
                    <span className="text-[12px] text-text-subtle">Нет связанных операций</span>
                  )}
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      to={`/operations/${r.id}`}
                      className="flex items-center justify-between rounded-[var(--radius-md)] border border-border px-3 py-2 hover:border-primary"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[12px] text-text">{r.reasonLabel}</span>
                        <span className="block text-[11px] text-text-subtle">
                          {fmtDateTimeFull(r.createdAt)}
                        </span>
                      </span>
                      <span
                        className={
                          'shrink-0 font-semibold tabular-nums ' +
                          (r.direction === 'accrual' ? 'text-pos' : 'text-neg')
                        }
                      >
                        {fmtBonus(r.amount, r.direction)}
                      </span>
                    </Link>
                  ))}
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </QueryBoundary>
    </div>
  )
}
