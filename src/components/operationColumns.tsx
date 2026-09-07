import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Operation } from '@/lib/types'
import { scenarioLabel } from '@/lib/dict'
import { fmtBonus, fmtDate, fmtDateTime, isoTooltip, shortRid } from '@/lib/format'
import { cn } from '@/lib/cn'
import { CopyId } from './CopyId'
import { DirectionTag, LifecycleBadge, PaymentBadge, StatusBadge } from './badges'
import { Tooltip } from './ui/overlays'

export interface OpColumn {
  id: keyof Operation | 'reasonLabel'
  header: string
  sortable: boolean
  defaultVisible: boolean
  align?: 'right'
  width: number
  cell: (op: Operation) => ReactNode
}

export const OP_COLUMNS: OpColumn[] = [
  {
    id: 'createdAt',
    header: 'Дата события',
    sortable: true,
    defaultVisible: true,
    width: 132,
    cell: (op) => (
      <Tooltip content={isoTooltip(op.createdAt)}>
        <span className="tabular-nums text-text-muted">{fmtDateTime(op.createdAt)}</span>
      </Tooltip>
    ),
  },
  {
    id: 'direction',
    header: 'Тип',
    sortable: true,
    defaultVisible: true,
    width: 116,
    cell: (op) => <DirectionTag direction={op.direction} />,
  },
  {
    id: 'reasonLabel',
    header: 'Причина',
    sortable: false,
    defaultVisible: true,
    width: 240,
    cell: (op) => (
      <div className="min-w-0">
        <div className="truncate text-text">{op.reasonLabel}</div>
        <div className="truncate text-[11px] text-text-subtle">
          {op.scenario ? scenarioLabel[op.scenario] : 'списание'}
          {op.promoSubtype ? ` · ${op.promoSubtype === 'transactional' ? 'транзакц.' : 'поведенч.'}` : ''}
        </div>
      </div>
    ),
  },
  {
    id: 'amount',
    header: 'Бонусы',
    sortable: true,
    defaultVisible: true,
    align: 'right',
    width: 96,
    cell: (op) => (
      <span
        className={cn(
          'font-semibold tabular-nums',
          op.direction === 'accrual' ? 'text-pos' : 'text-neg',
          op.status === 'blocked' && 'text-text-subtle line-through',
        )}
      >
        {fmtBonus(op.amount, op.direction)}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Статус',
    sortable: true,
    defaultVisible: true,
    width: 128,
    cell: (op) => <StatusBadge status={op.status} />,
  },
  {
    id: 'lifecycle',
    header: 'Состояние',
    sortable: false,
    defaultVisible: false,
    width: 116,
    cell: (op) =>
      op.lifecycle === 'normal' ? (
        <span className="text-text-subtle">—</span>
      ) : (
        <LifecycleBadge lifecycle={op.lifecycle} />
      ),
  },
  {
    id: 'userId',
    header: 'Пользователь',
    sortable: true,
    defaultVisible: true,
    width: 116,
    cell: (op) => (
      <Link
        to={`/users/${op.userId}`}
        className="font-mono text-[11.5px] text-primary hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {op.userId}
      </Link>
    ),
  },
  {
    id: 'rid',
    header: 'Рид',
    sortable: false,
    defaultVisible: true,
    width: 176,
    cell: (op) =>
      op.rid ? (
        <div className="flex items-center gap-1">
          <Link
            to={`/rids/${encodeURIComponent(op.rid)}`}
            className="font-mono text-[11.5px] text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {shortRid(op.rid)}
          </Link>
          <CopyId value={op.rid} display="" mono />
        </div>
      ) : (
        <span className="text-text-subtle">—</span>
      ),
  },
  {
    id: 'promoName',
    header: 'Акция',
    sortable: false,
    defaultVisible: true,
    width: 200,
    cell: (op) =>
      op.promoId != null ? (
        <Link
          to={`/promos/${op.promoId}`}
          className="block truncate text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          #{op.promoId} {op.promoName}
        </Link>
      ) : (
        <span className="text-text-subtle">—</span>
      ),
  },
  {
    id: 'paymentType',
    header: 'Оплата',
    sortable: true,
    defaultVisible: true,
    width: 150,
    cell: (op) => <PaymentBadge type={op.paymentType} eligible={op.bonusEligible} />,
  },
  {
    id: 'effectiveAt',
    header: 'Факт. начисление',
    sortable: true,
    defaultVisible: false,
    width: 132,
    cell: (op) => <span className="tabular-nums text-text-muted">{fmtDate(op.effectiveAt)}</span>,
  },
  {
    id: 'expiresAt',
    header: 'Сгорание',
    sortable: true,
    defaultVisible: false,
    width: 116,
    cell: (op) => <span className="tabular-nums text-text-muted">{fmtDate(op.expiresAt)}</span>,
  },
  {
    id: 'segmentName',
    header: 'Сегмент',
    sortable: false,
    defaultVisible: false,
    width: 180,
    cell: (op) =>
      op.segmentId != null ? (
        <Link
          to={`/segments/${op.segmentId}`}
          className="block truncate text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          #{op.segmentId} {op.segmentName}
        </Link>
      ) : (
        <span className="text-text-subtle">—</span>
      ),
  },
  {
    id: 'sourceSystem',
    header: 'Внешняя система',
    sortable: false,
    defaultVisible: false,
    width: 150,
    cell: (op) => op.sourceSystem ?? <span className="text-text-subtle">—</span>,
  },
  {
    id: 'id',
    header: 'ID операции',
    sortable: false,
    defaultVisible: true,
    width: 150,
    cell: (op) => (
      <Link to={`/operations/${op.id}`} onClick={(e) => e.stopPropagation()}>
        <CopyId value={op.id} display={<span className="text-primary hover:underline">{op.shortId}</span>} />
      </Link>
    ),
  },
]

export const OP_COLUMN_MAP = new Map(OP_COLUMNS.map((c) => [c.id, c]))
export const DEFAULT_VISIBLE = OP_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.id as string)
