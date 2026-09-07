import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { suggestUserIds } from '@/mock/api'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/misc'
import { Input } from '@/components/ui/form'

export function UserLookupPage() {
  const [id, setId] = useState('')
  const navigate = useNavigate()
  const { data: examples = [] } = useQuery({
    queryKey: ['user-suggest', id],
    queryFn: () => suggestUserIds(id),
  })

  const go = () => {
    const n = Number(id.trim())
    if (n) navigate(`/users/${n}`)
  }

  return (
    <div>
      <PageHeader title="Пользователь" subtitle="Карточка 360: баланс, операции, акции, сегменты и риды" />
      <Card className="max-w-xl">
        <CardBody className="flex flex-col gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              go()
            }}
            className="flex gap-2"
          >
            <Input
              autoFocus
              inputMode="numeric"
              value={id}
              onChange={(e) => setId(e.target.value.replace(/\D/g, ''))}
              placeholder="ID пользователя (4–12 цифр)"
              className="h-9 text-[14px]"
            />
            <Button type="submit" variant="primary" disabled={!id} className="h-9">
              Открыть
            </Button>
          </form>

          <div>
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-text-subtle">
              {id ? 'Совпадения' : 'Примеры из данных'}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {examples.map((u) => (
                <Link
                  key={u}
                  to={`/users/${u}`}
                  className="rounded-[var(--radius-sm)] border border-border-strong bg-surface-2 px-2 py-1 font-mono text-[11.5px] text-text hover:border-primary hover:text-primary"
                >
                  {u}
                </Link>
              ))}
              {examples.length === 0 && (
                <span className="text-[12px] text-text-subtle">Нет совпадений</span>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
