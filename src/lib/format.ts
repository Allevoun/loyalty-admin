import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/ru'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('ru')

export const MSK = 'Europe/Moscow'

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return dayjs(iso).tz(MSK).format('DD.MM.YYYY HH:mm')
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return dayjs(iso).tz(MSK).format('DD.MM.YYYY')
}

export function fmtDateTimeFull(iso: string | null | undefined): string {
  if (!iso) return '—'
  return dayjs(iso).tz(MSK).format('DD.MM.YYYY HH:mm:ss [МСК]')
}

export function isoTooltip(iso: string | null | undefined): string {
  if (!iso) return ''
  return dayjs(iso).toISOString()
}

export function relTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const now = dayjs('2026-09-08T12:00:00+03:00')
  const d = dayjs(iso)
  const days = now.diff(d, 'day')
  if (days === 0) return 'сегодня'
  if (days === 1) return 'вчера'
  if (days < 0) return `через ${plural(-days, ['день', 'дня', 'дней'])}`
  if (days < 30) return `${plural(days, ['день', 'дня', 'дней'])} назад`
  const months = now.diff(d, 'month')
  if (months < 12) return `${plural(months, ['месяц', 'месяца', 'месяцев'])} назад`
  return `${plural(now.diff(d, 'year'), ['год', 'года', 'лет'])} назад`
}

export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100
  const n1 = abs % 10
  let form = forms[2]
  if (abs > 10 && abs < 20) form = forms[2]
  else if (n1 > 1 && n1 < 5) form = forms[1]
  else if (n1 === 1) form = forms[0]
  return `${n.toLocaleString('ru-RU')} ${form}`
}

const nf0 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

/** Бонусы — целые, со знаком по направлению */
export function fmtBonus(amount: number, direction: 'accrual' | 'redemption'): string {
  const sign = direction === 'accrual' ? '+' : '−'
  return `${sign}${nf0.format(Math.abs(amount))}`
}

export function fmtNumber(n: number): string {
  return nf0.format(n)
}

export function fmtMoney(n: number): string {
  return `${nf0.format(Math.round(n))} ₽`
}

export function shortUuid(id: string): string {
  return id.slice(0, 8)
}

/** Обрезка рида для таблицы (он длинный) */
export function shortRid(rid: string | null): string {
  if (!rid) return '—'
  if (rid.length <= 22) return rid
  return `${rid.slice(0, 12)}…${rid.slice(-6)}`
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  return dayjs(iso).tz(MSK).diff(dayjs('2026-09-08T12:00:00+03:00'), 'day')
}
