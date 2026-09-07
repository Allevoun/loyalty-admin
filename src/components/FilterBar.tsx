import { useEffect, useState } from 'react'
import type { AccrualScenario, Direction, Lifecycle, OperationFilters, OperationReason, OperationStatus, PaymentType } from '@/lib/types'
import { ACCRUAL_SCENARIO, LIFECYCLE, OPERATION_STATUS } from '@/lib/types'
import {
  lifecycleLabel,
  paymentTypeLabel,
  reasonGroups,
  reasonLabel,
  scenarioLabel,
  statusLabel,
} from '@/lib/dict'
import { Button } from './ui/Button'
import { Checkbox, Field, Input, NativeSelect } from './ui/form'
import { Popover } from './ui/overlays'
import { Card } from './ui/misc'

const EMPTY: OperationFilters = {}

function clean(f: OperationFilters): OperationFilters {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(f)) {
    if (v === undefined || v === '' || v === null) continue
    if (Array.isArray(v) && v.length === 0) continue
    out[k] = v
  }
  return out as OperationFilters
}

export function FilterBar({
  value,
  onApply,
  lockUser,
  hideStatus,
}: {
  value: OperationFilters
  onApply: (f: OperationFilters) => void
  lockUser?: boolean
  hideStatus?: boolean
}) {
  const [draft, setDraft] = useState<OperationFilters>(value)
  useEffect(() => setDraft(value), [value])

  const set = <K extends keyof OperationFilters>(k: K, v: OperationFilters[K]) =>
    setDraft((d) => ({ ...d, [k]: v }))

  const apply = () => onApply(clean(draft))
  const reset = () => {
    setDraft(lockUser ? { userId: value.userId } : EMPTY)
    onApply(lockUser ? { userId: value.userId } : EMPTY)
  }

  const reasons = draft.reasons ?? []
  const toggleReason = (r: OperationReason, on: boolean) =>
    set('reasons', on ? [...reasons, r] : reasons.filter((x) => x !== r))

  const activeCount = Object.keys(clean(draft)).filter((k) => !(lockUser && k === 'userId')).length

  return (
    <Card className="p-3">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          apply()
        }}
        className="grid grid-cols-2 gap-x-3 gap-y-2.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      >
        {!lockUser && (
          <Field label="ID пользователя">
            <Input
              inputMode="numeric"
              value={draft.userId ?? ''}
              onChange={(e) => set('userId', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="напр. 480217"
            />
          </Field>
        )}
        <Field label="Рид">
          <Input
            value={draft.rid ?? ''}
            onChange={(e) => set('rid', e.target.value || undefined)}
            placeholder="полное значение"
          />
        </Field>
        <Field label="ID акции">
          <Input
            inputMode="numeric"
            value={draft.promoId ?? ''}
            onChange={(e) => set('promoId', e.target.value ? Number(e.target.value) : undefined)}
          />
        </Field>
        <Field label="ID сегмента">
          <Input
            inputMode="numeric"
            value={draft.segmentId ?? ''}
            onChange={(e) => set('segmentId', e.target.value ? Number(e.target.value) : undefined)}
          />
        </Field>

        <Field label="Направление">
          <NativeSelect
            value={draft.direction ?? ''}
            onChange={(e) => set('direction', (e.target.value || undefined) as Direction | undefined)}
          >
            <option value="">Все</option>
            <option value="accrual">Начисление</option>
            <option value="redemption">Списание</option>
          </NativeSelect>
        </Field>

        <Field label="Сценарий">
          <NativeSelect
            value={draft.scenario ?? ''}
            onChange={(e) => set('scenario', (e.target.value || undefined) as AccrualScenario | undefined)}
          >
            <option value="">Все</option>
            {ACCRUAL_SCENARIO.map((s) => (
              <option key={s} value={s}>
                {scenarioLabel[s]}
              </option>
            ))}
          </NativeSelect>
        </Field>

        <Field label="Причина">
          <Popover
            align="start"
            className="w-72"
            trigger={
              <button
                type="button"
                className="flex h-8 w-full items-center justify-between rounded-[var(--radius-md)] border border-border-strong bg-surface px-2.5 text-[13px] text-text"
              >
                <span className={reasons.length ? 'text-text' : 'text-text-subtle'}>
                  {reasons.length ? `Выбрано: ${reasons.length}` : 'Любая'}
                </span>
                <span className="text-text-subtle">▾</span>
              </button>
            }
          >
            <div className="flex max-h-80 flex-col gap-2 overflow-auto">
              {reasonGroups.map((g) => (
                <div key={g.group}>
                  <div className="mb-1 text-[10.5px] font-medium uppercase tracking-wide text-text-subtle">
                    {g.group}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {g.reasons.map((r) => (
                      <Checkbox
                        key={r}
                        checked={reasons.includes(r)}
                        onCheckedChange={(v) => toggleReason(r, v)}
                        label={reasonLabel[r]}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {reasons.length > 0 && (
                <button
                  type="button"
                  className="mt-1 text-left text-[11px] text-primary hover:underline"
                  onClick={() => set('reasons', undefined)}
                >
                  Очистить
                </button>
              )}
            </div>
          </Popover>
        </Field>

        {!hideStatus && (
          <Field label="Статус">
            <NativeSelect
              value={draft.status ?? ''}
              onChange={(e) => set('status', (e.target.value || undefined) as OperationStatus | undefined)}
            >
              <option value="">Все</option>
              {OPERATION_STATUS.map((s) => (
                <option key={s} value={s}>
                  {statusLabel[s]}
                </option>
              ))}
            </NativeSelect>
          </Field>
        )}

        <Field label="Тип оплаты">
          <NativeSelect
            value={draft.paymentType ?? ''}
            onChange={(e) => set('paymentType', (e.target.value || undefined) as PaymentType | undefined)}
          >
            <option value="">Все</option>
            <option value="true_bank">{paymentTypeLabel.true_bank}</option>
            <option value="no_true_bank">{paymentTypeLabel.no_true_bank}</option>
          </NativeSelect>
        </Field>

        <Field label="Бонусы разрешены">
          <NativeSelect
            value={draft.bonusEligible === undefined ? '' : draft.bonusEligible ? 'y' : 'n'}
            onChange={(e) =>
              set('bonusEligible', e.target.value === '' ? undefined : e.target.value === 'y')
            }
          >
            <option value="">Не важно</option>
            <option value="y">Да</option>
            <option value="n">Нет</option>
          </NativeSelect>
        </Field>

        <Field label="Состояние начисления">
          <NativeSelect
            value={draft.lifecycle ?? ''}
            onChange={(e) => set('lifecycle', (e.target.value || undefined) as Lifecycle | undefined)}
          >
            <option value="">Все</option>
            {LIFECYCLE.map((l) => (
              <option key={l} value={l}>
                {lifecycleLabel[l]}
              </option>
            ))}
          </NativeSelect>
        </Field>

        <Field label="Период — с">
          <Input
            type="date"
            value={draft.dateFrom?.slice(0, 10) ?? ''}
            onChange={(e) =>
              set('dateFrom', e.target.value ? `${e.target.value}T00:00:00+03:00` : undefined)
            }
          />
        </Field>
        <Field label="Период — по">
          <Input
            type="date"
            value={draft.dateTo?.slice(0, 10) ?? ''}
            onChange={(e) =>
              set('dateTo', e.target.value ? `${e.target.value}T23:59:59+03:00` : undefined)
            }
          />
        </Field>

        <Field label="Сумма от">
          <Input
            inputMode="numeric"
            value={draft.amountMin ?? ''}
            onChange={(e) => set('amountMin', e.target.value ? Number(e.target.value) : undefined)}
          />
        </Field>
        <Field label="Сумма до">
          <Input
            inputMode="numeric"
            value={draft.amountMax ?? ''}
            onChange={(e) => set('amountMax', e.target.value ? Number(e.target.value) : undefined)}
          />
        </Field>

        <div className="col-span-2 flex items-end gap-2 md:col-span-3 lg:col-span-4 xl:col-span-6">
          <Button type="submit" variant="primary" size="sm">
            Применить фильтры
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={reset} disabled={activeCount === 0}>
            Сбросить{activeCount > 0 ? ` (${activeCount})` : ''}
          </Button>
        </div>
      </form>
    </Card>
  )
}
