import { reasonLabel as REASON_LABEL } from '@/lib/dict'
import type {
  ManualBatch,
  Operation,
  Promo,
  PromoStatus,
  PromoSubtype,
  Rid,
  RidStatus,
  Segment,
  SegmentMembership,
  UserBalance,
} from '@/lib/types'
import { makeRid, Rng, uuidFrom } from './seed'

const NOW = Date.parse('2026-09-08T12:00:00+03:00')
const RANGE_START = '2024-06-01T00:00:00+03:00'
const DAY = 86_400_000

const CATEGORIES = [
  'Смартфоны',
  'Ноутбуки',
  'Бытовая техника',
  'Одежда',
  'Обувь',
  'Красота и здоровье',
  'Детские товары',
  'Продукты',
  'Спорт',
  'Автотовары',
  'Книги',
  'Товары для дома',
]

const API_SYSTEMS = [
  'partner-cashback',
  'mobile-app-quests',
  'crm-campaigns',
  'referral-service',
  'support-goodwill',
]

const BATCH_AUTHORS = ['Иванова А. М.', 'Петров С. В.', 'Смирнова О. Д.', 'Кузнецов Д. А.', 'Волкова Н. П.']
const BATCH_REASONS = [
  'Компенсация за инцидент с доставкой',
  'Приветственный бонус новым клиентам',
  'Возврат по обращению в поддержку',
  'Бонус участникам закрытого бета-теста',
  'Компенсация недоступности сервиса 12.03',
  'Поощрение амбассадоров бренда',
]

const SEGMENT_DEFS = [
  ['Новые клиенты 30 дней', 'Первая покупка совершена за последние 30 дней'],
  ['Риск оттока', 'Нет покупок 90+ дней при активности в прошлом'],
  ['Покупатели электроники', 'Покупка в категориях Смартфоны / Ноутбуки за 180 дней'],
  ['VIP-клиенты', 'Сумма покупок за год превышает 300 000 ₽'],
  ['Спящие 180 дней', 'Нет активности более 180 дней'],
  ['Пользователи мобильного приложения', 'Совершали заказы из мобильного приложения'],
  ['Подписчики Prime', 'Активная платная подписка'],
  ['Реактивированные', 'Вернулись после длительного перерыва'],
  ['Покупатели с высоким чеком', 'Средний чек выше 15 000 ₽'],
  ['Участники реферальной программы', 'Пригласили хотя бы одного друга'],
  ['Родители', 'Регулярные покупки в категории Детские товары'],
  ['Экономные', 'Более 70% заказов с промокодом или бонусами'],
  ['Кросс-категорийные', 'Покупки в 4+ категориях за квартал'],
  ['Городские курьерские зоны', 'Доставка день-в-день доступна'],
]

function isoPlusDays(iso: string, days: number): string {
  return new Date(Date.parse(iso) + days * DAY).toISOString()
}

export interface Dataset {
  operations: Operation[]
  promos: Promo[]
  segments: Segment[]
  memberships: SegmentMembership[]
  batches: ManualBatch[]
  rids: Rid[]
  userIds: number[]
  balances: UserBalance[]
}

export function generateDataset(seed = 20260908): Dataset {
  const rng = new Rng(seed)

  /* ---------------- users ---------------- */
  const userIds: number[] = []
  const seen = new Set<number>()
  const lengths = [4, 5, 6, 7, 8, 9, 10, 12]
  while (userIds.length < 60) {
    const len = rng.pick(lengths)
    const min = 10 ** (len - 1)
    const max = 10 ** len - 1
    const id = rng.int(min, Math.min(max, min * 9))
    if (!seen.has(id)) {
      seen.add(id)
      userIds.push(id)
    }
  }
  userIds.sort((a, b) => a - b)
  const powerUsers = new Set(rng.sample(userIds, 4))

  /* ---------------- segments ---------------- */
  const segments: Segment[] = SEGMENT_DEFS.map(([name, description], i) => ({
    id: i + 1,
    name,
    description,
    usersCount: 0,
    linkedPromoIds: [],
    createdAt: rng.dateBetween(RANGE_START, '2025-06-01T00:00:00+03:00'),
  }))

  /* ---------------- memberships ---------------- */
  const memberships: SegmentMembership[] = []
  for (const seg of segments) {
    const n = rng.int(8, 34)
    const members = rng.sample(userIds, n)
    for (const uid of members) {
      memberships.push({
        segmentId: seg.id,
        userId: uid,
        joinedAt: rng.dateBetween(seg.createdAt, '2026-09-01T00:00:00+03:00'),
      })
    }
    seg.usersCount = members.length
  }
  const membersBySegment = new Map<number, SegmentMembership[]>()
  for (const m of memberships) {
    const list = membersBySegment.get(m.segmentId) ?? []
    list.push(m)
    membersBySegment.set(m.segmentId, list)
  }

  /* ---------------- promos ---------------- */
  const promoNamesTx = [
    'Кэшбэк 5% на технику',
    'Двойные бонусы за первый заказ',
    'Бонусы за покупку от 3 000 ₽',
    'Осенняя распродажа: +300 бонусов',
    'Бонусы за 3 товара в чеке',
    'Гик-неделя: бонусы за электронику',
    'Бонусы за покупку в приложении',
    'Чёрная пятница: тройной кэшбэк',
    'Бонусы за товары для дома',
    'Новогодний кэшбэк',
    'Бонусы за детские товары',
    'Летний бонус за спорттовары',
    'Бонусы за косметику премиум',
    'Кэшбэк на первую подписку',
    'Мегараспродажа 11.11',
    'Бонусы за продукты каждый день',
    'Кэшбэк на бытовую технику',
    'Бонусы за заказ от 5 000 ₽',
    'Весенний кэшбэк на одежду',
    'Выходные двойных бонусов',
  ]
  const promoNamesBhv = [
    'Заполни профиль — получи бонусы',
    'Бонус за попадание в сегмент VIP',
    'Вернись к нам — бонус реактивации',
    'Бонус за подключение Prime',
    'Приведи друга — бонус',
    'Бонус за установку приложения',
    'Бонус активным читателям',
    'Бонус за первую волну беты',
    'Бонус за первую покупку в приложении',
    'Бонус за подписку на рассылку',
  ]
  let txCursor = 0
  let bhvCursor = 0
  const promos: Promo[] = []
  for (let i = 1; i <= 28; i++) {
    const subtype: PromoSubtype = rng.weighted<PromoSubtype>([
      ['transactional', 0.62],
      ['behavioral', 0.38],
    ])
    const status: PromoStatus = rng.weighted<PromoStatus>([
      ['active', 0.4],
      ['finished', 0.38],
      ['paused', 0.12],
      ['draft', 0.1],
    ])
    const createdAt = rng.dateBetween(RANGE_START, '2026-07-01T00:00:00+03:00')
    let startsAt: string
    let endsAt: string
    if (status === 'finished') {
      startsAt = rng.dateBetween(RANGE_START, '2026-01-01T00:00:00+03:00')
      endsAt = isoPlusDays(startsAt, rng.int(20, 120))
    } else if (status === 'draft') {
      startsAt = rng.dateBetween('2026-09-20T00:00:00+03:00', '2026-12-01T00:00:00+03:00')
      endsAt = isoPlusDays(startsAt, rng.int(20, 90))
    } else {
      startsAt = rng.dateBetween('2026-02-15T00:00:00+03:00', '2026-07-10T00:00:00+03:00')
      endsAt = isoPlusDays(startsAt, rng.int(45, 170))
    }
    const bonusPerCompletion = rng.weighted([
      [rng.int(100, 400), 0.5],
      [rng.int(400, 1200), 0.35],
      [rng.int(1200, 3500), 0.15],
    ])
    const budgetTotal = rng.int(3, 60) * 100_000
    const name =
      subtype === 'transactional'
        ? promoNamesTx[txCursor++ % promoNamesTx.length]
        : promoNamesBhv[bhvCursor++ % promoNamesBhv.length]

    let condition: Promo['condition']
    if (subtype === 'transactional') {
      const cats = rng.sample(CATEGORIES, rng.int(1, 3))
      const minOrderAmount = rng.pick([0, 1000, 2000, 3000, 5000, 10_000])
      const minItems = rng.pick([1, 1, 1, 2, 3])
      const bits = [
        minOrderAmount ? `сумма заказа от ${minOrderAmount.toLocaleString('ru-RU')} ₽` : null,
        minItems > 1 ? `не менее ${minItems} товаров в чеке` : null,
        cats.length ? `категории: ${cats.join(', ')}` : null,
        'оплата картой внутреннего банка МП',
      ].filter(Boolean)
      condition = {
        minOrderAmount: minOrderAmount || undefined,
        minItems: minItems > 1 ? minItems : undefined,
        categories: cats,
        description: bits.join('; '),
      }
    } else {
      const seg = rng.pick(segments)
      seg.linkedPromoIds.push(i)
      condition = {
        segmentId: seg.id,
        segmentName: seg.name,
        description: `пользователь попал в сегмент «${seg.name}»`,
      }
    }

    promos.push({
      id: i,
      name,
      subtype,
      status,
      startsAt,
      endsAt,
      bonusPerCompletion,
      budgetTotal,
      budgetSpent: 0,
      participantsCount: 0,
      accruedTotal: 0,
      condition,
      createdAt,
    })
  }
  const promoById = new Map(promos.map((p) => [p.id, p]))
  const txPromos = promos.filter((p) => p.subtype === 'transactional' && p.status !== 'draft')

  /* ---------------- operations / rids ---------------- */
  const operations: Operation[] = []
  const rids: Rid[] = []
  const ridsByUser = new Map<number, Rid[]>()

  const mkOp = (o: Partial<Operation> & Pick<Operation, 'direction' | 'amount' | 'reason' | 'userId' | 'createdAt'>): Operation => {
    const id = uuidFrom(rng)
    const base: Operation = {
      id,
      shortId: id.slice(0, 8),
      direction: o.direction,
      amount: Math.max(1, Math.round(o.amount)),
      status: o.status ?? (o.direction === 'accrual' ? 'credited' : 'debited'),
      scenario: o.scenario ?? null,
      reason: o.reason,
      reasonLabel: o.reasonLabel ?? REASON_LABEL[o.reason],
      promoSubtype: o.promoSubtype ?? null,
      createdAt: o.createdAt,
      effectiveAt: o.effectiveAt ?? null,
      expiresAt: o.expiresAt ?? null,
      userId: o.userId,
      rid: o.rid ?? null,
      promoId: o.promoId ?? null,
      promoName: o.promoName ?? null,
      segmentId: o.segmentId ?? null,
      segmentName: o.segmentName ?? null,
      paymentType: o.paymentType ?? null,
      bonusEligible: o.bonusEligible ?? true,
      sourceSystem: o.sourceSystem ?? null,
      idempotencyKey: o.idempotencyKey ?? null,
      manualBatchId: o.manualBatchId ?? null,
      relatedRid: o.relatedRid ?? null,
      relatedOperationId: o.relatedOperationId ?? null,
      lifecycle: o.lifecycle ?? 'normal',
    }
    operations.push(base)
    return base
  }

  for (const uid of userIds) {
    const ridCount = powerUsers.has(uid) ? rng.int(90, 180) : rng.int(4, 40)
    for (let k = 0; k < ridCount; k++) {
      const rid = makeRid(rng)
      const purchasedAt = rng.dateBetween(RANGE_START, '2026-08-20T00:00:00+03:00')
      const orderAmount = rng.weighted([
        [rng.int(500, 4000), 0.45],
        [rng.int(4000, 20_000), 0.4],
        [rng.int(20_000, 90_000), 0.15],
      ])
      const noTrueBank = rng.bool(0.12)
      const paymentType = noTrueBank ? 'no_true_bank' : 'true_bank'
      const bonusEligible = !noTrueBank
      const status: RidStatus = rng.weighted<RidStatus>([
        ['active', 0.84],
        ['returned', 0.1],
        ['cancelled', 0.06],
      ])
      const redeemedAt = status === 'cancelled' ? null : isoPlusDays(purchasedAt, rng.int(1, 12))

      const ridPromoIds: number[] = []
      const ridObj: Rid = {
        rid,
        userId: uid,
        orderAmount,
        paymentType,
        bonusEligible,
        status,
        purchasedAt,
        redeemedAt,
        promoIds: ridPromoIds,
      }
      rids.push(ridObj)
      const list = ridsByUser.get(uid) ?? []
      list.push(ridObj)
      ridsByUser.set(uid, list)

      const rate = rng.float(0.01, 0.05)
      const baseBonus = Math.max(1, Math.round(orderAmount * rate))

      if (!bonusEligible) {
        // попытки, заблокированные типом оплаты
        if (redeemedAt) {
          mkOp({
            direction: 'accrual',
            amount: baseBonus,
            reason: 'purchase_base',
            scenario: 'purchase_base',
            status: 'blocked',
            bonusEligible: false,
            paymentType,
            userId: uid,
            rid,
            createdAt: redeemedAt,
          })
          if (rng.bool(0.35)) {
            mkOp({
              direction: 'redemption',
              amount: rng.int(100, Math.max(200, Math.round(orderAmount * 0.4))),
              reason: 'redeem_purchase',
              status: 'blocked',
              bonusEligible: false,
              paymentType,
              userId: uid,
              rid,
              createdAt: redeemedAt,
            })
          }
        }
        continue
      }

      // базовое начисление
      let baseOp: Operation | null = null
      if (redeemedAt) {
        const effectiveAt = isoPlusDays(redeemedAt, 14)
        const expiresAt = isoPlusDays(effectiveAt, rng.int(300, 400))
        baseOp = mkOp({
          direction: 'accrual',
          amount: baseBonus,
          reason: 'purchase_base',
          scenario: 'purchase_base',
          reasonLabel: 'Покупка товара',
          status: Date.parse(effectiveAt) > NOW ? 'pending' : 'credited',
          paymentType,
          userId: uid,
          rid,
          createdAt: redeemedAt,
          effectiveAt,
          expiresAt,
        })

        // транзакционная акция
        if (rng.bool(0.28)) {
          const candidates = txPromos.filter(
            (p) =>
              Date.parse(p.startsAt) <= Date.parse(purchasedAt) &&
              Date.parse(p.endsAt) >= Date.parse(purchasedAt) &&
              !ridPromoIds.includes(p.id),
          )
          if (candidates.length) {
            const p = rng.pick(candidates)
            ridPromoIds.push(p.id)
            const pEff = isoPlusDays(redeemedAt, 14)
            mkOp({
              direction: 'accrual',
              amount: p.bonusPerCompletion,
              reason: 'promo',
              scenario: 'promo',
              reasonLabel: p.name,
              promoSubtype: 'transactional',
              promoId: p.id,
              promoName: p.name,
              status: Date.parse(pEff) > NOW ? 'pending' : 'credited',
              paymentType,
              userId: uid,
              rid,
              createdAt: redeemedAt,
              effectiveAt: pEff,
              expiresAt: isoPlusDays(pEff, rng.int(300, 400)),
            })
          }
        }

        // списание при покупке
        let redeemOp: Operation | null = null
        if (rng.bool(0.32)) {
          const spend = rng.int(100, Math.max(200, Math.round(orderAmount * 0.45)))
          redeemOp = mkOp({
            direction: 'redemption',
            amount: spend,
            reason: 'redeem_purchase',
            reasonLabel: 'Списание при покупке',
            status: 'debited',
            paymentType,
            userId: uid,
            rid,
            createdAt: redeemedAt,
          })
        }

        // возврат / отмена
        if (status === 'returned') {
          const revAt = isoPlusDays(purchasedAt, rng.int(16, 45))
          if (baseOp) {
            baseOp.lifecycle = 'clawed_back'
            mkOp({
              direction: 'redemption',
              amount: baseOp.amount,
              reason: 'clawback_goods_returned',
              status: 'debited',
              paymentType,
              userId: uid,
              rid,
              createdAt: revAt,
              relatedRid: rid,
              relatedOperationId: baseOp.id,
            })
          }
          if (redeemOp) {
            mkOp({
              direction: 'accrual',
              amount: redeemOp.amount,
              reason: 'refund_goods_returned',
              scenario: 'refund',
              status: 'credited',
              paymentType,
              userId: uid,
              rid,
              createdAt: revAt,
              effectiveAt: revAt,
              expiresAt: isoPlusDays(revAt, rng.int(300, 400)),
              relatedRid: rid,
              relatedOperationId: redeemOp.id,
            })
          }
        }
      } else if (status === 'cancelled' && rng.bool(0.5)) {
        // отмена заказа с ранее списанными на оформлении бонусами
        const spend = rng.int(100, Math.max(200, Math.round(orderAmount * 0.4)))
        const redeemOp = mkOp({
          direction: 'redemption',
          amount: spend,
          reason: 'redeem_purchase',
          status: 'debited',
          paymentType,
          userId: uid,
          rid,
          createdAt: purchasedAt,
        })
        const revAt = isoPlusDays(purchasedAt, rng.int(2, 20))
        mkOp({
          direction: 'accrual',
          amount: spend,
          reason: 'refund_order_cancelled',
          scenario: 'refund',
          status: 'credited',
          paymentType,
          userId: uid,
          rid,
          createdAt: revAt,
          effectiveAt: revAt,
          expiresAt: isoPlusDays(revAt, rng.int(300, 400)),
          relatedRid: rid,
          relatedOperationId: redeemOp.id,
        })
      }
    }
  }

  /* ------- поведенческие акции ------- */
  for (const p of promos) {
    if (p.subtype !== 'behavioral' || p.status === 'draft' || !p.condition.segmentId) continue
    const members = membersBySegment.get(p.condition.segmentId) ?? []
    for (const m of members) {
      if (!rng.bool(0.65)) continue
      const at = new Date(
        Math.max(Date.parse(m.joinedAt), Date.parse(p.startsAt)) + rng.int(0, 3) * DAY,
      ).toISOString()
      if (Date.parse(at) > Date.parse(p.endsAt) || Date.parse(at) > NOW) continue
      mkOp({
        direction: 'accrual',
        amount: p.bonusPerCompletion,
        reason: 'promo',
        scenario: 'promo',
        reasonLabel: p.name,
        promoSubtype: 'behavioral',
        promoId: p.id,
        promoName: p.name,
        segmentId: p.condition.segmentId,
        segmentName: p.condition.segmentName ?? null,
        status: 'credited',
        userId: m.userId,
        createdAt: at,
        effectiveAt: at,
        expiresAt: isoPlusDays(at, rng.int(300, 400)),
      })
    }
  }

  /* ------- ручные начисления ------- */
  const batches: ManualBatch[] = []
  for (let i = 0; i < 12; i++) {
    const createdAt = rng.dateBetween('2024-09-01T00:00:00+03:00', '2026-09-01T00:00:00+03:00')
    const members = rng.sample(userIds, rng.int(6, 40))
    const bonusPerUser = rng.pick([200, 300, 500, 750, 1000, 1500, 2000])
    const batch: ManualBatch = {
      id: uuidFrom(rng),
      createdAt,
      author: rng.pick(BATCH_AUTHORS),
      reason: rng.pick(BATCH_REASONS),
      sourceFileName: `batch_${new Date(createdAt).toISOString().slice(0, 10)}_${i + 1}.xlsx`,
      usersCount: members.length,
      totalAmount: members.length * bonusPerUser,
      bonusPerUser,
    }
    batches.push(batch)
    for (const uid of members) {
      mkOp({
        direction: 'accrual',
        amount: bonusPerUser,
        reason: 'manual',
        scenario: 'manual',
        reasonLabel: batch.reason,
        manualBatchId: batch.id,
        status: 'credited',
        userId: uid,
        createdAt,
        effectiveAt: createdAt,
        expiresAt: isoPlusDays(createdAt, rng.int(300, 400)),
      })
    }
  }

  /* ------- API начисления ------- */
  for (let i = 0; i < 240; i++) {
    const uid = rng.pick(userIds)
    const system = rng.pick(API_SYSTEMS)
    const withRid = rng.bool(0.4)
    const userRids = ridsByUser.get(uid) ?? []
    const rid = withRid && userRids.length ? rng.pick(userRids).rid : null
    const createdAt = rng.dateBetween('2025-01-01T00:00:00+03:00', '2026-09-06T00:00:00+03:00')
    mkOp({
      direction: 'accrual',
      amount: rng.int(50, 1500),
      reason: 'api',
      scenario: 'api',
      reasonLabel: `API · ${system}`,
      sourceSystem: system,
      idempotencyKey: `${system}:${uuidFrom(rng).slice(0, 18)}`,
      status: 'credited',
      userId: uid,
      rid,
      createdAt,
      effectiveAt: createdAt,
      expiresAt: isoPlusDays(createdAt, rng.int(300, 400)),
    })
  }

  /* ------- сгорание ------- */
  for (const op of [...operations]) {
    if (
      op.direction === 'accrual' &&
      op.status === 'credited' &&
      op.lifecycle === 'normal' &&
      op.expiresAt &&
      Date.parse(op.expiresAt) < NOW &&
      rng.bool(0.75)
    ) {
      op.lifecycle = 'expired'
      mkOp({
        direction: 'redemption',
        amount: op.amount,
        reason: 'expiration',
        reasonLabel: 'Сгорание бонусов',
        status: 'debited',
        userId: op.userId,
        rid: op.rid,
        createdAt: op.expiresAt,
        relatedOperationId: op.id,
        relatedRid: op.rid,
      })
    }
  }

  /* ---------------- aggregates ---------------- */
  operations.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))

  // promo aggregates
  const promoUsers = new Map<number, Set<number>>()
  for (const op of operations) {
    if (op.promoId == null) continue
    const p = promoById.get(op.promoId)
    if (!p) continue
    if (op.direction === 'accrual' && op.status !== 'blocked') {
      p.accruedTotal += op.amount
      const s = promoUsers.get(op.promoId) ?? new Set<number>()
      s.add(op.userId)
      promoUsers.set(op.promoId, s)
    }
  }
  for (const p of promos) {
    p.participantsCount = promoUsers.get(p.id)?.size ?? 0
    p.budgetSpent = Math.min(p.budgetTotal, p.accruedTotal)
  }

  // balances
  const balances: UserBalance[] = userIds.map((uid) => {
    const ops = operations.filter((o) => o.userId === uid)
    let available = 0
    let pending = 0
    let expiredTotal = 0
    let clawedBackTotal = 0
    const upcoming: { amount: number; date: string }[] = []
    let first = NOW
    let last = 0
    for (const o of ops) {
      const ts = Date.parse(o.createdAt)
      if (ts < first) first = ts
      if (ts > last) last = ts
      if (o.status === 'blocked') continue
      if (o.direction === 'accrual') {
        if (o.status === 'pending') pending += o.amount
        const live =
          o.status === 'credited' &&
          o.lifecycle === 'normal' &&
          (!o.expiresAt || Date.parse(o.expiresAt) > NOW)
        if (live) {
          available += o.amount
          if (o.expiresAt) upcoming.push({ amount: o.amount, date: o.expiresAt })
        }
      } else {
        if (o.reason === 'expiration') expiredTotal += o.amount
        else if (o.reason === 'clawback_goods_returned') clawedBackTotal += o.amount
        else available -= o.amount // redeem_purchase
      }
    }
    upcoming.sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
    let nextExpiry: UserBalance['nextExpiry'] = null
    if (upcoming.length) {
      const d = upcoming[0].date.slice(0, 10)
      nextExpiry = {
        date: upcoming[0].date,
        amount: upcoming.filter((u) => u.date.slice(0, 10) === d).reduce((s, u) => s + u.amount, 0),
      }
    }
    return {
      userId: uid,
      available: Math.max(0, Math.round(available)),
      pending: Math.round(pending),
      expiredTotal: Math.round(expiredTotal),
      clawedBackTotal: Math.round(clawedBackTotal),
      nextExpiry,
      firstSeenAt: new Date(first).toISOString(),
      lastActivityAt: new Date(last || first).toISOString(),
    }
  })

  return { operations, promos, segments, memberships, batches, rids, userIds, balances }
}
