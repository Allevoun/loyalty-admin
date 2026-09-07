import { db } from '@/mock/db'
import type { Operation } from './types'
import {
  directionLabel,
  lifecycleLabel,
  paymentTypeLabel,
  promoSubtypeLabel,
  reasonLabel,
  ridStatusLabel,
  scenarioLabel,
  statusLabel,
} from './dict'
import { fmtDateTimeFull } from './format'

/** Плоская денормализованная строка операции для выгрузки (все поля). */
export function flattenOperation(op: Operation): Record<string, string | number> {
  const rid = op.rid ? db.ridByKey.get(op.rid) : undefined
  const batch = op.manualBatchId ? db.batchById.get(op.manualBatchId) : undefined
  return {
    'ID операции': op.id,
    'Короткий ID': op.shortId,
    Направление: directionLabel[op.direction],
    'Сумма бонусов': (op.direction === 'accrual' ? 1 : -1) * op.amount,
    'Сумма (модуль)': op.amount,
    Статус: statusLabel[op.status],
    Сценарий: op.scenario ? scenarioLabel[op.scenario] : '',
    Причина: reasonLabel[op.reason],
    'Причина (код)': op.reason,
    'Название причины': op.reasonLabel,
    'Подтип акции': op.promoSubtype ? promoSubtypeLabel[op.promoSubtype] : '',
    'Дата события (МСК)': fmtDateTimeFull(op.createdAt),
    'Дата фактического начисления (МСК)': op.effectiveAt ? fmtDateTimeFull(op.effectiveAt) : '',
    'Дата сгорания (МСК)': op.expiresAt ? fmtDateTimeFull(op.expiresAt) : '',
    'ID пользователя': op.userId,
    Рид: op.rid ?? '',
    'ID акции': op.promoId ?? '',
    'Название акции': op.promoName ?? '',
    'ID сегмента': op.segmentId ?? '',
    'Название сегмента': op.segmentName ?? '',
    'Тип оплаты': op.paymentType ? paymentTypeLabel[op.paymentType] : '',
    'Бонусы разрешены': op.bonusEligible ? 'да' : 'нет',
    'Внешняя система': op.sourceSystem ?? '',
    'Idempotency key': op.idempotencyKey ?? '',
    'ID батча': op.manualBatchId ?? '',
    'Причина батча': batch?.reason ?? '',
    'Связанный рид': op.relatedRid ?? '',
    'Связанная операция': op.relatedOperationId ?? '',
    'Состояние начисления': lifecycleLabel[op.lifecycle],
    'Сумма заказа, ₽': rid?.orderAmount ?? '',
    'Статус рида': rid ? ridStatusLabel[rid.status] : '',
  }
}

export const EXPORT_COLUMNS = Object.keys(flattenOperation(fakeOp()))

function fakeOp(): Operation {
  return {
    id: '',
    shortId: '',
    direction: 'accrual',
    amount: 0,
    status: 'credited',
    scenario: 'purchase_base',
    reason: 'purchase_base',
    reasonLabel: '',
    promoSubtype: null,
    createdAt: '2026-01-01T00:00:00Z',
    effectiveAt: null,
    expiresAt: null,
    userId: 0,
    rid: null,
    promoId: null,
    promoName: null,
    segmentId: null,
    segmentName: null,
    paymentType: null,
    bonusEligible: true,
    sourceSystem: null,
    idempotencyKey: null,
    manualBatchId: null,
    relatedRid: null,
    relatedOperationId: null,
    lifecycle: 'normal',
  }
}
