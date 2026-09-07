import { PageHeader } from '@/components/PageHeader'
import { OperationsExplorer } from '@/components/OperationsExplorer'
import { Card, CardBody } from '@/components/ui/misc'

export function BlockedPage() {
  return (
    <div>
      <PageHeader
        title="Заблокированные операции"
        subtitle="Начисления и списания, не проведённые из-за типа оплаты или возврата рида"
      />
      <Card className="mb-4">
        <CardBody className="text-[12px] text-text-muted">
          Здесь собраны операции-попытки со статусом «Заблокировано»: система рассчитала сумму, но не
          провела её, потому что заказ оплачен не картой внутреннего банка маркетплейса. Это основной
          сценарий разбора обращений «почему не начислили / не дали списать».
        </CardBody>
      </Card>
      <OperationsExplorer
        storageKey="blocked"
        baseFilters={{ status: 'blocked' }}
        hideStatus
        summaryText="только заблокированные операции"
      />
    </div>
  )
}
