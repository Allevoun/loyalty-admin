/* ================================================================== */
/*  Domain model — loyalty admin (read-only)                            */
/*  TS `enum` is disabled (erasableSyntaxOnly) — use const maps + unions */
/* ================================================================== */

export const NOW_ISO = '2026-09-08T12:00:00+03:00'

/** начисление / списание */
export const DIRECTION = ['accrual', 'redemption'] as const
export type Direction = (typeof DIRECTION)[number]

/** Статусы операций */
export const OPERATION_STATUS = ['pending', 'credited', 'debited', 'blocked'] as const
export type OperationStatus = (typeof OPERATION_STATUS)[number]

/** Сценарий начисления (верхнеуровневый) */
export const ACCRUAL_SCENARIO = ['purchase_base', 'promo', 'manual', 'api', 'refund'] as const
export type AccrualScenario = (typeof ACCRUAL_SCENARIO)[number]

/** Причина операции — плоский справочник для фильтра */
export const OPERATION_REASON = [
  // accrual
  'purchase_base',
  'promo',
  'manual',
  'api',
  'refund_goods_returned',
  'refund_order_cancelled',
  'refund_wrong_bank',
  // redemption
  'redeem_purchase',
  'expiration',
  'clawback_goods_returned',
] as const
export type OperationReason = (typeof OPERATION_REASON)[number]

export const PROMO_SUBTYPE = ['transactional', 'behavioral'] as const
export type PromoSubtype = (typeof PROMO_SUBTYPE)[number]

export const PROMO_STATUS = ['draft', 'active', 'paused', 'finished'] as const
export type PromoStatus = (typeof PROMO_STATUS)[number]

export const PAYMENT_TYPE = ['true_bank', 'no_true_bank'] as const
export type PaymentType = (typeof PAYMENT_TYPE)[number]

export const RID_STATUS = ['active', 'returned', 'cancelled'] as const
export type RidStatus = (typeof RID_STATUS)[number]

/** Итоговое вычисляемое состояние начисления (по связанным операциям) */
export const LIFECYCLE = ['normal', 'expired', 'clawed_back', 'partially_reverted'] as const
export type Lifecycle = (typeof LIFECYCLE)[number]

/* ------------------------------------------------------------------ */

export interface Operation {
  id: string // uuid
  shortId: string // первые 8 символов uuid, для отображения
  direction: Direction
  amount: number // всегда > 0
  status: OperationStatus
  scenario: AccrualScenario | null // для redemption = null
  reason: OperationReason
  reasonLabel: string // человекочитаемое условное название причины
  promoSubtype: PromoSubtype | null

  createdAt: string // ISO, событие
  effectiveAt: string | null // для accrual: выкуп + 14 дней
  expiresAt: string | null // для accrual: фикс. дата сгорания

  userId: number
  rid: string | null
  promoId: number | null
  promoName: string | null
  segmentId: number | null
  segmentName: string | null

  paymentType: PaymentType | null
  bonusEligible: boolean

  sourceSystem: string | null // api
  idempotencyKey: string | null // api
  manualBatchId: string | null // manual

  relatedRid: string | null
  relatedOperationId: string | null

  lifecycle: Lifecycle
}

export interface PromoCondition {
  minOrderAmount?: number
  categories?: string[]
  productSkus?: string[]
  minItems?: number
  segmentId?: number
  segmentName?: string
  description: string
}

export interface Promo {
  id: number
  name: string
  subtype: PromoSubtype
  status: PromoStatus
  startsAt: string
  endsAt: string
  bonusPerCompletion: number
  budgetTotal: number
  budgetSpent: number
  participantsCount: number
  accruedTotal: number
  condition: PromoCondition
  createdAt: string
}

export interface Segment {
  id: number
  name: string
  description: string
  usersCount: number
  linkedPromoIds: number[]
  createdAt: string
}

export interface SegmentMembership {
  segmentId: number
  userId: number
  joinedAt: string
}

export interface ManualBatch {
  id: string
  createdAt: string
  author: string
  reason: string
  sourceFileName: string
  usersCount: number
  totalAmount: number
  bonusPerUser: number
}

export interface Rid {
  rid: string
  userId: number
  orderAmount: number
  paymentType: PaymentType
  bonusEligible: boolean
  status: RidStatus
  purchasedAt: string
  redeemedAt: string | null // выкуп
  promoIds: number[]
}

export interface UserBalance {
  userId: number
  available: number
  pending: number
  expiredTotal: number
  clawedBackTotal: number
  nextExpiry: { amount: number; date: string } | null
  firstSeenAt: string
  lastActivityAt: string
}

/* ------------------------------------------------------------------ */
/*  Query / API contract                                               */
/* ------------------------------------------------------------------ */

export interface OperationFilters {
  userId?: number
  rid?: string
  promoId?: number
  segmentId?: number
  manualBatchId?: string
  direction?: Direction
  reasons?: OperationReason[]
  scenario?: AccrualScenario
  status?: OperationStatus
  paymentType?: PaymentType
  bonusEligible?: boolean
  lifecycle?: Lifecycle
  dateFrom?: string
  dateTo?: string
  amountMin?: number
  amountMax?: number
  search?: string // свободный текст (reasonLabel / promoName)
}

export type SortDir = 'asc' | 'desc'

export interface Page<T> {
  rows: T[]
  nextCursor: string | null
  total: number
}

export type SmartMatchKind =
  | 'user'
  | 'operation'
  | 'rid'
  | 'promo'
  | 'segment'
  | 'manual_batch'
  | 'unknown'

export interface SmartMatch {
  kind: SmartMatchKind
  label: string
  hint: string
  to: string
}
