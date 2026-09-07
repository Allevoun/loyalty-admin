/** Детерминированный ГПСЧ (mulberry32) — стабильные моки между перезагрузками */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let tt = Math.imul(a ^ (a >>> 15), 1 | a)
    tt = (tt + Math.imul(tt ^ (tt >>> 7), 61 | tt)) ^ tt
    return ((tt ^ (tt >>> 14)) >>> 0) / 4294967296
  }
}

export class Rng {
  private r: () => number
  constructor(seed: number) {
    this.r = mulberry32(seed)
  }
  next() {
    return this.r()
  }
  int(min: number, max: number) {
    return Math.floor(this.r() * (max - min + 1)) + min
  }
  float(min: number, max: number) {
    return this.r() * (max - min) + min
  }
  bool(pTrue = 0.5) {
    return this.r() < pTrue
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.r() * arr.length)]
  }
  weighted<T>(pairs: [T, number][]): T {
    const total = pairs.reduce((s, [, w]) => s + w, 0)
    let x = this.r() * total
    for (const [v, w] of pairs) {
      x -= w
      if (x <= 0) return v
    }
    return pairs[pairs.length - 1][0]
  }
  sample<T>(arr: readonly T[], n: number): T[] {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.r() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy.slice(0, n)
  }
  /** случайная дата ISO между двумя ISO */
  dateBetween(fromIso: string, toIso: string): string {
    const a = Date.parse(fromIso)
    const b = Date.parse(toIso)
    return new Date(a + this.r() * (b - a)).toISOString()
  }
}

const HEX = '0123456789abcdef'
export function uuidFrom(rng: Rng): string {
  let s = ''
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) s += '-'
    s += HEX[rng.int(0, 15)]
  }
  // выставим версию/вариант просто для вида
  return `${s.slice(0, 14)}4${s.slice(15, 19)}${s.slice(19)}`
}

const RID_ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const RID_REGIONS = ['RU', 'KZ', 'BY', 'AM', 'KG']
/**
 * рид — длинное многосоставное значение из ~18 групп,
 * точки-разделители, буквы + цифры. Он же номер заказа.
 */
export function makeRid(rng: Rng): string {
  const parts: string[] = []
  parts.push(String(rng.int(2023, 2026)))
  parts.push(rng.pick(RID_REGIONS))
  for (let i = 0; i < 16; i++) {
    const kind = rng.int(0, 2)
    if (kind === 0) parts.push(String(rng.int(0, 9)))
    else if (kind === 1) parts.push(String(rng.int(10, 9999)))
    else {
      let g = ''
      const len = rng.int(2, 4)
      for (let j = 0; j < len; j++) {
        g += rng.bool() ? RID_ALPHA[rng.int(0, RID_ALPHA.length - 1)] : String(rng.int(0, 9))
      }
      parts.push(g)
    }
  }
  return parts.join('.')
}
