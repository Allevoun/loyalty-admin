import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listSegments } from '@/mock/api'
import { fmtDate, fmtNumber } from '@/lib/format'
import { useDebounced } from '@/hooks/useDebounced'
import { PageHeader } from '@/components/PageHeader'
import { Card, EmptyState, Skeleton } from '@/components/ui/misc'
import { Input } from '@/components/ui/form'

export function SegmentsPage() {
  const [search, setSearch] = useState('')
  const d = useDebounced(search, 250)
  const q = useQuery({ queryKey: ['segments', d], queryFn: () => listSegments(d || undefined) })

  return (
    <div>
      <PageHeader
        title="Сегменты"
        subtitle="Наборы пользователей — основа поведенческих акций лояльности"
      />
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Название или ID сегмента"
        className="mb-4 h-8 w-64"
      />

      {q.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (q.data ?? []).length === 0 ? (
        <EmptyState title="Сегменты не найдены" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(q.data ?? []).map((s) => (
            <Link key={s.id} to={`/segments/${s.id}`}>
              <Card className="h-full p-4 transition-colors hover:border-primary">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text-subtle">#{s.id}</span>
                  <span className="text-[11.5px] text-text-muted">
                    {fmtNumber(s.usersCount)} польз.
                  </span>
                </div>
                <div className="mt-1 text-[13px] font-semibold text-text">{s.name}</div>
                <p className="mt-1 line-clamp-2 text-[11.5px] text-text-muted">{s.description}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-text-subtle">
                  <span>{s.linkedPromoIds.length} связ. акций</span>
                  <span>с {fmtDate(s.createdAt)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
