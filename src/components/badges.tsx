import type {
  Direction,
  Lifecycle,
  OperationStatus,
  PaymentType,
  PromoStatus,
  PromoSubtype,
  RidStatus,
} from '@/lib/types'
import {
  lifecycleLabel,
  paymentTypeLabel,
  promoStatusLabel,
  promoSubtypeLabel,
  ridStatusLabel,
  statusLabel,
} from '@/lib/dict'
import { Badge } from './ui/misc'

export function StatusBadge({ status }: { status: OperationStatus }) {
  const tone = (
    { pending: 'warn', credited: 'pos', debited: 'info', blocked: 'neg' } as const
  )[status]
  return (
    <Badge tone={tone} dot>
      {statusLabel[status]}
    </Badge>
  )
}

export function DirectionTag({ direction }: { direction: Direction }) {
  return direction === 'accrual' ? (
    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-pos">
      <span className="text-[14px] leading-none">↑</span> Начисление
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-neg">
      <span className="text-[14px] leading-none">↓</span> Списание
    </span>
  )
}

export function LifecycleBadge({ lifecycle }: { lifecycle: Lifecycle }) {
  if (lifecycle === 'normal') return null
  const tone = ({ expired: 'neutral', clawed_back: 'neg', partially_reverted: 'warn' } as const)[
    lifecycle
  ]
  return <Badge tone={tone}>{lifecycleLabel[lifecycle]}</Badge>
}

export function PaymentBadge({
  type,
  eligible,
}: {
  type: PaymentType | null
  eligible?: boolean
}) {
  if (!type) return <span className="text-text-subtle">—</span>
  if (type === 'true_bank')
    return (
      <Badge tone="pos">
        {paymentTypeLabel.true_bank}
      </Badge>
    )
  return (
    <Badge tone={eligible === false ? 'neg' : 'warn'}>{paymentTypeLabel.no_true_bank}</Badge>
  )
}

export function PromoStatusBadge({ status }: { status: PromoStatus }) {
  const tone = (
    { active: 'pos', finished: 'neutral', paused: 'warn', draft: 'info' } as const
  )[status]
  return (
    <Badge tone={tone} dot>
      {promoStatusLabel[status]}
    </Badge>
  )
}

export function PromoSubtypeBadge({ subtype }: { subtype: PromoSubtype }) {
  return (
    <Badge tone={subtype === 'transactional' ? 'primary' : 'info'}>
      {promoSubtypeLabel[subtype]}
    </Badge>
  )
}

export function RidStatusBadge({ status }: { status: RidStatus }) {
  const tone = ({ active: 'pos', returned: 'warn', cancelled: 'neg' } as const)[status]
  return (
    <Badge tone={tone} dot>
      {ridStatusLabel[status]}
    </Badge>
  )
}
