import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getBatch } from '@/mock/api'
import { fmtDateTimeFull, fmtNumber } from '@/lib/format'
import { PageHeader } from '@/components/PageHeader'
import { QueryBoundary } from '@/components/QueryBoundary'
import { CopyId } from '@/components/CopyId'
import { OperationsExplorer } from '@/components/OperationsExplorer'
import { Card, CardBody, CardHeader, CardTitle, DList, DRow, Stat } from '@/components/ui/misc'

export function BatchPage() {
  const { id = '' } = useParams()
  const q = useQuery({ queryKey: ['batch', id], queryFn: () => getBatch(id) })

  return (
    <div>
      <PageHeader
        title="Ручное начисление"
        subtitle={<CopyId value={id} />}
        back={{ to: '/search', label: 'К поиску' }}
      />
      <QueryBoundary query={q} notFoundTitle="Батч не найден">
        {({ batch }) => (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Пользователей" value={fmtNumber(batch.usersCount)} />
              <Stat label="Начислено всего" value={fmtNumber(batch.totalAmount)} tone="pos" />
              <Stat label="На пользователя" value={fmtNumber(batch.bonusPerUser)} />
              <Stat label="Автор" value={<span className="text-[13px]">{batch.author}</span>} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Параметры</CardTitle>
              </CardHeader>
              <CardBody>
                <DList>
                  <DRow label="Причина">{batch.reason}</DRow>
                  <DRow label="Файл-источник">{batch.sourceFileName}</DRow>
                  <DRow label="Создан">{fmtDateTimeFull(batch.createdAt)}</DRow>
                  <DRow label="ID батча">
                    <CopyId value={batch.id} />
                  </DRow>
                </DList>
              </CardBody>
            </Card>

            <div>
              <h3 className="mb-3 text-[13px] font-semibold text-text">Начисления батча</h3>
              <OperationsExplorer
                storageKey="batch-ops"
                baseFilters={{ manualBatchId: batch.id }}
                summaryText={`батч ${batch.id.slice(0, 8)}`}
              />
            </div>
          </div>
        )}
      </QueryBoundary>
    </div>
  )
}
