import { Button } from './ui/Button'
import { Checkbox } from './ui/form'
import { Popover } from './ui/overlays'
import { DEFAULT_VISIBLE, OP_COLUMNS } from './operationColumns'

export function ColumnMenu({
  visible,
  onChange,
}: {
  visible: string[]
  onChange: (next: string[]) => void
}) {
  const toggle = (id: string, on: boolean) => {
    if (on) {
      // keep canonical column order
      onChange(OP_COLUMNS.filter((c) => visible.includes(c.id) || c.id === id).map((c) => c.id))
    } else {
      onChange(visible.filter((v) => v !== id))
    }
  }

  return (
    <Popover
      align="end"
      className="w-64"
      trigger={
        <Button variant="default" size="sm">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 3h12M2 8h12M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Колонки
        </Button>
      }
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-text-subtle">
          Отображаемые колонки
        </span>
        <button
          type="button"
          className="text-[11px] text-primary hover:underline"
          onClick={() => onChange(DEFAULT_VISIBLE)}
        >
          Сбросить
        </button>
      </div>
      <div className="scroll-thin flex max-h-72 flex-col gap-1.5 overflow-auto pr-1">
        {OP_COLUMNS.map((c) => (
          <Checkbox
            key={c.id}
            checked={visible.includes(c.id)}
            onCheckedChange={(v) => toggle(c.id, v)}
            label={c.header}
          />
        ))}
      </div>
    </Popover>
  )
}
