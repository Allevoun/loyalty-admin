import type {
  ManualBatch,
  Operation,
  OperationFilters,
  Page,
  Promo,
  PromoStatus,
  PromoSubtype,
  Rid,
  Segment,
  SegmentMembership,
  SmartMatch,
  SortDir,
} from '@/lib/types'
import { db } from './db'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
const lag = () => delay(120 + Math.random() * 260)

export interface Sort {
  field: keyof Operation
  dir: SortDir
}

/* ------------------------------------------------------------------ */
/*  Operations search                                                  */
/* ------------------------------------------------------------------ */

function matchOp(op: Operation, f: OperationFilters): boolean {
  if (f.userId != null && op.userId !== f.userId) return false
  if (f.rid && op.rid !== f.rid) return false
  if (f.promoId != null && op.promoId !== f.promoId) return false
  if (f.segmentId != null && op.segmentId !== f.segmentId) return false
  if (f.manualBatchId && op.manualBatchId !== f.manualBatchId) return false
  if (f.direction && op.direction !== f.direction) return false
  if (f.reasons && f.reasons.length && !f.reasons.includes(op.reason)) return false
  if (f.scenario && op.scenario !== f.scenario) return false
  if (f.status && op.status !== f.status) return false
  if (f.paymentType && op.paymentType !== f.paymentType) return false
  if (f.bonusEligible != null && op.bonusEligible !== f.bonusEligible) return false
  if (f.lifecycle && op.lifecycle !== f.lifecycle) return false
  if (f.amountMin != null && op.amount < f.amountMin) return false
  if (f.amountMax != null && op.amount > f.amountMax) return false
  if (f.dateFrom && Date.parse(op.createdAt) < Date.parse(f.dateFrom)) return false
  if (f.dateTo && Date.parse(op.createdAt) > Date.parse(f.dateTo)) return false
  if (f.search) {
    const q = f.search.toLowerCase()
    const hay = `${op.reasonLabel} ${op.promoName ?? ''} ${op.segmentName ?? ''} ${op.sourceSystem ?? ''} ${op.id} ${op.rid ?? ''} ${op.userId}`.toLowerCase()
    if (!hay.includes(q)) return false
  }
  return true
}

function compare(a: Operation, b: Operation, s: Sort): number {
  const av = a[s.field]
  const bv = b[s.field]
  let r = 0
  if (av == null && bv == null) r = 0
  else if (av == null) r = -1
  else if (bv == null) r = 1
  else if (typeof av === 'number' && typeof bv === 'number') r = av - bv
  else if (s.field === 'createdAt' || s.field === 'effectiveAt' || s.field === 'expiresAt')
    r = Date.parse(String(av)) - Date.parse(String(bv))
  else r = String(av).localeCompare(String(bv), 'ru')
  return s.dir === 'asc' ? r : -r
}

export async function searchOperations(
  filters: OperationFilters,
  sort: Sort,
  cursor: string | null,
  limit = 50,
): Promise<Page<Operation>> {
  await lag()
  let rows = db.data.operations.filter((op) => matchOp(op, filters))
  rows = [...rows].sort((a, b) => compare(a, b, sort))
  const offset = cursor ? Number(cursor) : 0
  const slice = rows.slice(offset, offset + limit)
  const nextOffset = offset + limit
  return {
    rows: slice,
    total: rows.length,
    nextCursor: nextOffset < rows.length ? String(nextOffset) : null,
  }
}

/** Полная выгрузка под экспорт (с предохранителем). */
export async function collectOperations(
  filters: OperationFilters,
  sort: Sort,
  cap = 1_000_000,
): Promise<Operation[]> {
  await lag()
  const rows = db.data.operations.filter((op) => matchOp(op, filters))
  rows.sort((a, b) => compare(a, b, sort))
  return rows.slice(0, cap)
}

export async function countOperations(filters: OperationFilters): Promise<number> {
  await delay(60)
  return db.data.operations.reduce((n, op) => (matchOp(op, filters) ? n + 1 : n), 0)
}

/* ------------------------------------------------------------------ */
/*  Single entities                                                    */
/* ------------------------------------------------------------------ */

export interface OperationDetail {
  operation: Operation
  related: Operation[]
  rid: Rid | null
  promo: Promo | null
  batch: ManualBatch | null
}

export async function getOperation(id: string): Promise<OperationDetail | null> {
  await lag()
  const operation = db.opById.get(id)
  if (!operation) return null
  const related: Operation[] = []
  if (operation.relatedOperationId) {
    const r = db.opById.get(operation.relatedOperationId)
    if (r) related.push(r)
  }
  for (const o of db.data.operations) {
    if (o.relatedOperationId === operation.id) related.push(o)
  }
  return {
    operation,
    related,
    rid: operation.rid ? (db.ridByKey.get(operation.rid) ?? null) : null,
    promo: operation.promoId != null ? (db.promoById.get(operation.promoId) ?? null) : null,
    batch: operation.manualBatchId ? (db.batchById.get(operation.manualBatchId) ?? null) : null,
  }
}

export interface UserOverview {
  userId: number
  exists: boolean
  balance: ReturnType<typeof getBalance>
  counts: {
    operations: number
    accruals: number
    redemptions: number
    blocked: number
    rids: number
    promos: number
    segments: number
  }
  promos: { promo: Promo; accrued: number; operations: number; lastAt: string }[]
  segments: { segment: Segment; joinedAt: string }[]
  rids: Rid[]
}

function getBalance(userId: number) {
  return db.data.balances.find((b) => b.userId === userId) ?? null
}

export async function getUserOverview(userId: number): Promise<UserOverview> {
  await lag()
  const ops = db.opsByUser.get(userId) ?? []
  const exists = db.userIdSet.has(userId) || ops.length > 0
  const promoMap = new Map<number, { promo: Promo; accrued: number; operations: number; lastAt: string }>()
  for (const op of ops) {
    if (op.promoId == null) continue
    const promo = db.promoById.get(op.promoId)
    if (!promo) continue
    const e = promoMap.get(op.promoId) ?? { promo, accrued: 0, operations: 0, lastAt: op.createdAt }
    e.operations += 1
    if (op.direction === 'accrual' && op.status !== 'blocked') e.accrued += op.amount
    if (Date.parse(op.createdAt) > Date.parse(e.lastAt)) e.lastAt = op.createdAt
    promoMap.set(op.promoId, e)
  }
  const segs = (db.segmentsByUser.get(userId) ?? []).map((m) => ({
    segment: db.segmentById.get(m.segmentId)!,
    joinedAt: m.joinedAt,
  }))
  const rids = db.data.rids.filter((r) => r.userId === userId)
  return {
    userId,
    exists,
    balance: getBalance(userId),
    counts: {
      operations: ops.length,
      accruals: ops.filter((o) => o.direction === 'accrual' && o.status !== 'blocked').length,
      redemptions: ops.filter((o) => o.direction === 'redemption' && o.status !== 'blocked').length,
      blocked: ops.filter((o) => o.status === 'blocked').length,
      rids: rids.length,
      promos: promoMap.size,
      segments: segs.length,
    },
    promos: [...promoMap.values()].sort((a, b) => Date.parse(b.lastAt) - Date.parse(a.lastAt)),
    segments: segs.sort((a, b) => Date.parse(b.joinedAt) - Date.parse(a.joinedAt)),
    rids: rids.sort((a, b) => Date.parse(b.purchasedAt) - Date.parse(a.purchasedAt)),
  }
}

export interface RidDetail {
  rid: Rid
  operations: Operation[]
  promos: Promo[]
}

export async function getRid(rid: string): Promise<RidDetail | null> {
  await lag()
  const r = db.ridByKey.get(rid)
  if (!r) return null
  const operations = (db.opsByRid.get(rid) ?? []).slice().sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
  const promoIds = new Set<number>(r.promoIds)
  for (const o of operations) if (o.promoId != null) promoIds.add(o.promoId)
  return {
    rid: r,
    operations,
    promos: [...promoIds].map((id) => db.promoById.get(id)).filter((p): p is Promo => !!p),
  }
}

/* ------------------------------------------------------------------ */
/*  Promos                                                             */
/* ------------------------------------------------------------------ */

export interface PromoFilters {
  search?: string
  subtype?: PromoSubtype
  status?: PromoStatus
}

export async function listPromos(f: PromoFilters = {}): Promise<Promo[]> {
  await lag()
  return db.data.promos
    .filter((p) => {
      if (f.subtype && p.subtype !== f.subtype) return false
      if (f.status && p.status !== f.status) return false
      if (f.search && !p.name.toLowerCase().includes(f.search.toLowerCase()) && String(p.id) !== f.search)
        return false
      return true
    })
    .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt))
}

export interface PromoDetail {
  promo: Promo
  segment: Segment | null
  participants: number
  operations: number
  accrued: number
  sampleOperations: Operation[]
}

export async function getPromo(id: number): Promise<PromoDetail | null> {
  await lag()
  const promo = db.promoById.get(id)
  if (!promo) return null
  const ops = db.opsByPromo.get(id) ?? []
  const users = new Set(ops.filter((o) => o.status !== 'blocked').map((o) => o.userId))
  return {
    promo,
    segment: promo.condition.segmentId ? (db.segmentById.get(promo.condition.segmentId) ?? null) : null,
    participants: users.size,
    operations: ops.length,
    accrued: ops.filter((o) => o.direction === 'accrual' && o.status !== 'blocked').reduce((s, o) => s + o.amount, 0),
    sampleOperations: [...ops]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 200),
  }
}

/* ------------------------------------------------------------------ */
/*  Segments                                                           */
/* ------------------------------------------------------------------ */

export async function listSegments(search?: string): Promise<Segment[]> {
  await lag()
  return db.data.segments
    .filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || String(s.id) === search)
    .sort((a, b) => a.id - b.id)
}

export interface SegmentDetail {
  segment: Segment
  members: (SegmentMembership & { operations: number; accrued: number })[]
  promos: Promo[]
}

export async function getSegment(id: number): Promise<SegmentDetail | null> {
  await lag()
  const segment = db.segmentById.get(id)
  if (!segment) return null
  const members = (db.membersBySegment.get(id) ?? []).map((m) => {
    const ops = (db.opsByUser.get(m.userId) ?? []).filter((o) => o.segmentId === id)
    return {
      ...m,
      operations: ops.length,
      accrued: ops.filter((o) => o.direction === 'accrual').reduce((s, o) => s + o.amount, 0),
    }
  })
  members.sort((a, b) => Date.parse(b.joinedAt) - Date.parse(a.joinedAt))
  const promos = db.data.promos.filter((p) => p.condition.segmentId === id)
  return { segment, members, promos }
}

/* ------------------------------------------------------------------ */
/*  Manual batches                                                     */
/* ------------------------------------------------------------------ */

export async function listBatches(): Promise<ManualBatch[]> {
  await lag()
  return [...db.data.batches].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
}

export async function getBatch(id: string): Promise<{ batch: ManualBatch; operations: Operation[] } | null> {
  await lag()
  const batch = db.batchById.get(id)
  if (!batch) return null
  return { batch, operations: db.opsByBatch.get(id) ?? [] }
}

/* ------------------------------------------------------------------ */
/*  Smart search                                                       */
/* ------------------------------------------------------------------ */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const UUID_SHORT_RE = /^[0-9a-f]{8}$/i

export async function smartMatch(raw: string): Promise<SmartMatch[]> {
  await delay(90)
  const q = raw.trim()
  if (!q) return []
  const out: SmartMatch[] = []

  // uuid операции
  if (UUID_RE.test(q)) {
    const op = db.opById.get(q.toLowerCase())
    if (op)
      out.push({
        kind: 'operation',
        label: `Операция ${op.shortId}`,
        hint: `${op.direction === 'accrual' ? 'начисление' : 'списание'} · ${op.reasonLabel}`,
        to: `/operations/${op.id}`,
      })
    const batch = db.batchById.get(q.toLowerCase())
    if (batch)
      out.push({
        kind: 'manual_batch',
        label: `Батч ручного начисления`,
        hint: batch.reason,
        to: `/batches/${batch.id}`,
      })
    if (out.length) return out
  }
  if (UUID_SHORT_RE.test(q)) {
    for (const op of db.data.operations) {
      if (op.shortId === q.toLowerCase()) {
        out.push({
          kind: 'operation',
          label: `Операция ${op.shortId}`,
          hint: `${op.direction === 'accrual' ? 'начисление' : 'списание'} · ${op.reasonLabel}`,
          to: `/operations/${op.id}`,
        })
        if (out.length >= 8) break
      }
    }
    if (out.length) return out
  }

  // рид — длинное значение с точками
  if (q.includes('.') && q.split('.').length >= 6) {
    const r = db.ridByKey.get(q)
    if (r)
      out.push({
        kind: 'rid',
        label: 'Рид (заказ)',
        hint: `пользователь ${r.userId} · ${r.status}`,
        to: `/rids/${encodeURIComponent(r.rid)}`,
      })
    else
      out.push({
        kind: 'unknown',
        label: 'Рид не найден',
        hint: q,
        to: `/rids/${encodeURIComponent(q)}`,
      })
    return out
  }

  // только цифры
  if (/^\d+$/.test(q)) {
    const n = Number(q)
    if (q.length >= 4 && q.length <= 12 && db.userIdSet.has(n)) {
      out.push({
        kind: 'user',
        label: `Пользователь ${n}`,
        hint: 'карточка пользователя',
        to: `/users/${n}`,
      })
    }
    if (q.length >= 4 && q.length <= 12 && !db.userIdSet.has(n)) {
      out.push({
        kind: 'user',
        label: `Пользователь ${n}`,
        hint: 'нет данных — открыть карточку',
        to: `/users/${n}`,
      })
    }
    if (n >= 1 && n <= 999) {
      const p = db.promoById.get(n)
      if (p) out.push({ kind: 'promo', label: `Акция #${n} — ${p.name}`, hint: 'карточка акции', to: `/promos/${n}` })
      const s = db.segmentById.get(n)
      if (s) out.push({ kind: 'segment', label: `Сегмент #${n} — ${s.name}`, hint: 'карточка сегмента', to: `/segments/${n}` })
    }
    return out
  }

  // свободный текст → акции / сегменты по названию
  const ql = q.toLowerCase()
  for (const p of db.data.promos) {
    if (p.name.toLowerCase().includes(ql)) {
      out.push({ kind: 'promo', label: `Акция #${p.id} — ${p.name}`, hint: 'по названию', to: `/promos/${p.id}` })
      if (out.length >= 6) break
    }
  }
  for (const s of db.data.segments) {
    if (s.name.toLowerCase().includes(ql)) {
      out.push({ kind: 'segment', label: `Сегмент #${s.id} — ${s.name}`, hint: 'по названию', to: `/segments/${s.id}` })
      if (out.length >= 10) break
    }
  }
  return out
}

export async function suggestUserIds(prefix: string): Promise<number[]> {
  await delay(50)
  if (!prefix) return db.data.userIds.slice(0, 8)
  return db.data.userIds.filter((u) => String(u).startsWith(prefix)).slice(0, 8)
}
