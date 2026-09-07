import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPromo } from '@/mock/api'
import { fmtDate, fmtNumber } from '@/lib/format'
import { PageHeader } from '@/components/PageHeader'
import { QueryBoundary } from '@/components/QueryBoundary'
import { OperationsExplorer } from '@/components/OperationsExplorer'
import { PromoStatusBadge, PromoSubtypeBadge } from '@/components/badges'
import { Card, CardBody, CardHeader, CardTitle, DList, DRow, Stat } from '@/components/ui/misc'

export function PromoPage() {
  const { id } = useParams()
  const promoId = Number(id)
  const q = useQuery({ queryKey: ['promo', promoId], queryFn: () => getPromo(promoId) })

  return (
    <div>
      <PageHeader title={`Акция #${promoId}`} back={{ to: '/promos', label: 'К каталогу акций' }} />
      <QueryBoundary query={q} notFoundTitle="Акция не найдена">
        {({ promo, segment, participants, operations, accrued }) => (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[16px] font-semibold text-text">{promo.name}</h2>
              <PromoSubtypeBadge subtype={promo.subtype} />
              <PromoStatusBadge status={promo.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Участники" value={fmtNumber(participants)} />
              <Stat label="Начислено бонусов" value={fmtNumber(accrued)} tone="pos" />
              <Stat label="Операций" value={fmtNumber(operations)} />
              <Stat
                label="Бюджет"
                value={`${fmtNumber(promo.budgetSpent)} / ${fmtNumber(promo.budgetTotal)}`}
                sub={`использовано ${Math.round((promo.budgetSpent / promo.budgetTotal) * 100)}%`}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Параметры</CardTitle>
                </CardHeader>
                <CardBody>
                  <DList>
                    <DRow label="Подтип">
                      {promo.subtype === 'transactional'
                        ? 'Транзакционный — начисление за покупку (рид)'
                        : 'Поведенческий — начисление за попадание в сегмент'}
                    </DRow>
                    <DRow label="Период">
                      {fmtDate(promo.startsAt)} — {fmtDate(promo.endsAt)}
                    </DRow>
                    <DRow label="Бонус за выполнение">{fmtNumber(promo.bonusPerCompletion)}</DRow>
                    <DRow label="Создана">{fmtDate(promo.createdAt)}</DRow>
                    {segment && (
                      <DRow label="Сегмент">
                        <Link to={`/segments/${segment.id}`} className="text-primary hover:underline">
                          #{segment.id} {segment.name}
                        </Link>
                      </DRow>
                    )}
                  </DList>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Условие задания</CardTitle>
                </CardHeader>
                <CardBody className="text-[12.5px] text-text">
                  <p className="text-text-muted">{promo.condition.description}</p>
                  <ul className="mt-3 space-y-1.5">
                    {promo.condition.minOrderAmount != null && (
                      <li>• Минимальная сумма заказа: {fmtNumber(promo.condition.minOrderAmount)} ₽</li>
                    )}
                    {promo.condition.minItems != null && (
                      <li>• Товаров в чеке: не менее {promo.condition.minItems}</li>
                    )}
                    {promo.condition.categories && promo.condition.categories.length > 0 && (
                      <li>• Категории: {promo.condition.categories.join(', ')}</li>
                    )}
                    <li>• Оплата картой внутреннего банка маркетплейса</li>
                  </ul>
                </CardBody>
              </Card>
            </div>

            <div>
              <h3 className="mb-3 text-[13px] font-semibold text-text">Операции по акции</h3>
              <OperationsExplorer
                storageKey="promo-ops"
                baseFilters={{ promoId }}
                summaryText={`акция #${promoId}`}
              />
            </div>
          </div>
        )}
      </QueryBoundary>
    </div>
  )
}
