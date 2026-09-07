import type { ManualBatch, Operation, Promo, Rid, Segment, SegmentMembership } from '@/lib/types'
import { generateDataset, type Dataset } from './generate'

class Db {
  readonly data: Dataset
  readonly opById = new Map<string, Operation>()
  readonly opsByUser = new Map<number, Operation[]>()
  readonly opsByRid = new Map<string, Operation[]>()
  readonly opsByPromo = new Map<number, Operation[]>()
  readonly opsBySegment = new Map<number, Operation[]>()
  readonly opsByBatch = new Map<string, Operation[]>()
  readonly promoById = new Map<number, Promo>()
  readonly segmentById = new Map<number, Segment>()
  readonly batchById = new Map<string, ManualBatch>()
  readonly ridByKey = new Map<string, Rid>()
  readonly membersBySegment = new Map<number, SegmentMembership[]>()
  readonly segmentsByUser = new Map<number, SegmentMembership[]>()
  readonly userIdSet = new Set<number>()

  constructor() {
    this.data = generateDataset()
    const push = <K>(m: Map<K, Operation[]>, k: K, op: Operation) => {
      const l = m.get(k) ?? []
      l.push(op)
      m.set(k, l)
    }
    for (const op of this.data.operations) {
      this.opById.set(op.id, op)
      push(this.opsByUser, op.userId, op)
      if (op.rid) push(this.opsByRid, op.rid, op)
      if (op.promoId != null) push(this.opsByPromo, op.promoId, op)
      if (op.segmentId != null) push(this.opsBySegment, op.segmentId, op)
      if (op.manualBatchId) push(this.opsByBatch, op.manualBatchId, op)
    }
    for (const p of this.data.promos) this.promoById.set(p.id, p)
    for (const s of this.data.segments) this.segmentById.set(s.id, s)
    for (const b of this.data.batches) this.batchById.set(b.id, b)
    for (const r of this.data.rids) this.ridByKey.set(r.rid, r)
    for (const m of this.data.memberships) {
      const a = this.membersBySegment.get(m.segmentId) ?? []
      a.push(m)
      this.membersBySegment.set(m.segmentId, a)
      const b = this.segmentsByUser.get(m.userId) ?? []
      b.push(m)
      this.segmentsByUser.set(m.userId, b)
    }
    for (const u of this.data.userIds) this.userIdSet.add(u)
  }
}

export const db = new Db()
