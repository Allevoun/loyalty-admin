import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listPromos } from '@/mock/api'
import type { PromoStatus, PromoSubtype } from '@/lib/types'
import { PROMO_STATUS, PROMO_SUBTYPE } from '@/lib/types'
import { promoStatusLabel, promoSubtypeLabel } from '@/lib/dict'
import { fmtDate, fmtNumber } from '@/lib/format'
import { useDebounced } from '@/hooks/useDebounced'
import { PageHeader } from '@/components/PageHeader'
import { PromoStatusBadge, PromoSubtypeBadge } from '@/components/badges'
import { Card, EmptyState, Skeleton } from '@/components/ui/misc'
import { Input, NativeSelect } from '@/components/ui/form'

export function PromosPage() {
  const [search, setSearch] = useState('')
  const [subtype, setSubtype] = useState<PromoSubtype | ''>('')
  const [status, setStatus] = useState<PromoStatus | ''>('')
  const dSearch = useDebounced(search, 250)

  const q = useQuery({
    queryKey: ['promos', dSearch, subtype, status],
    queryFn: () =>
      listPromos({
        search: dSearch || undefined,
        subtype: subtype || undefined,
        status: status || undefined,
      }),
  })

  const totals = useMemo(() => {
    const list = q.data ?? []
    return {
      count: list.length,
      accrued: list.reduce((s, p) => s + p.accruedTotal, 0),
      participants: list.reduce((s, p) => s + p.participantsCount, 0),
    }
  }, [q.data])

  return (
    <div>
      <PageHeader
        title="Акции"
        subtitle="Каталог сценариев начисления по заданиям лояльности со сводной статистикой"
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Название или ID акции"
          className="h-8 w-64"
        />
        <NativeSelect
          value={subtype}
          onChange={(e) => setSubtype(e.target.value as PromoSubtype | '')}
          className="w-48"
        >
          <option value="">Все подтипы</option>
          {PROMO_SUBTYPE.map((s) => (
            <option key={s} value={s}>
              {promoSubtypeLabel[s]}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={status}
          onChange={(e) => setStatus(e.target.value as PromoStatus | '')}
          className="w-44"
        >
          <option value="">Все статусы</option>
          {PROMO_STATUS.map((s) => (
            <option key={s} value={s}>
              {promoStatusLabel[s]}
            </option>
          ))}
        </NativeSelect>
        <div className="ml-auto text-[12px] text-text-muted">
          {totals.count} акц. · начислено {fmtNumber(totals.accrued)} · участников{' '}
          {fmtNumber(totals.participants)}
        </div>
      </div>

      <Card className="overflow-hidden">
        {q.isLoading ? (
          <div className="p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="mb-2 h-9" />
            ))}
          </div>
        ) : (q.data ?? []).length === 0 ? (
          <EmptyState title="Акции не найдены" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="bg-surface-2 text-[11px] uppercase tracking-wide text-text-subtle">
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-left font-medium">Акция</th>
                  <th className="px-4 py-2.5 text-left font-medium">Подтип</th>
                  <th className="px-4 py-2.5 text-left font-medium">Статус</th>
                  <th className="px-4 py-2.5 text-left font-medium">Период</th>
                  <th className="px-4 py-2.5 text-right font-medium">Участники</th>
                  <th className="px-4 py-2.5 text-right font-medium">Начислено</th>
                  <th className="px-4 py-2.5 text-right font-medium">Бюджет</th>
                </tr>
              </thead>
              <tbody>
                {(q.data ?? []).map((p) => {
                  const usage = p.budgetTotal ? Math.min(100, (p.budgetSpent / p.budgetTotal) * 100) : 0
                  return (
                    <tr key={p.id} className="border-b border-border/60 hover:bg-surface-2/50">
                      <td className="px-4 py-2.5">
                        <Link to={`/promos/${p.id}`} className="font-medium text-primary hover:underline">
                          #{p.id} {p.name}
                        </Link>
                        <div className="mt-0.5 max-w-md truncate text-[11px] text-text-subtle">
                          {p.condition.description}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <PromoSubtypeBadge subtype={p.subtype} />
                      </td>
                      <td className="px-4 py-2.5">
                        <PromoStatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-text-muted">
                        {fmtDate(p.startsAt)} — {fmtDate(p.endsAt)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {fmtNumber(p.participantsCount)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-pos">
                        +{fmtNumber(p.accruedTotal)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="tabular-nums text-text-muted">
                          {fmtNumber(p.budgetSpent)} / {fmtNumber(p.budgetTotal)}
                        </div>
                        <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-surface-3">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${usage}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
