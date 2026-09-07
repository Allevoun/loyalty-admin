import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import * as XLSX from 'xlsx'
import { collectOperations, type Sort } from '@/mock/api'
import { flattenOperation } from '@/lib/exportRows'
import type { OperationFilters } from '@/lib/types'

export type ExportFormat = 'xlsx' | 'csv'

interface EnqueueParams {
  title: string
  summary: string
  format: ExportFormat
  filters: OperationFilters
  sort: Sort
}
export type ExportStatus = 'queued' | 'preparing' | 'ready' | 'error' | 'expired'

export interface ExportJob {
  id: string
  title: string
  summary: string
  format: ExportFormat
  status: ExportStatus
  progress: number
  rowCount: number
  createdAt: string
  filename: string
  error?: string
}

interface JobRuntime {
  filters: OperationFilters
  sort: Sort
  blob?: Blob
}

const KEY = 'la.exports'
const SYNC_CAP = 1_000_000

interface ExportsCtx {
  jobs: ExportJob[]
  enqueue: (p: EnqueueParams) => string
  download: (id: string) => void
  remove: (id: string) => void
  regenerate: (id: string) => void
}

const Ctx = createContext<ExportsCtx>({
  jobs: [],
  enqueue: () => '',
  download: () => {},
  remove: () => {},
  regenerate: () => {},
})

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

async function buildBlob(
  filters: OperationFilters,
  sort: Sort,
  format: ExportFormat,
  onProgress: (p: number) => void,
): Promise<{ blob: Blob; rowCount: number }> {
  const ops = await collectOperations(filters, sort, SYNC_CAP)
  onProgress(0.15)
  const rows = ops.map((op) => flattenOperation(op))
  onProgress(0.55)
  await new Promise((r) => setTimeout(r, 250))

  if (format === 'csv') {
    const headers = rows.length ? Object.keys(rows[0]) : []
    const esc = (v: unknown) => {
      const s = String(v ?? '')
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const body = rows.map((r) => headers.map((h) => esc(r[h])).join(';')).join('\r\n')
    const csv = '﻿' + headers.join(';') + '\r\n' + body
    onProgress(0.95)
    return { blob: new Blob([csv], { type: 'text/csv;charset=utf-8' }), rowCount: rows.length }
  }

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Операции')
  onProgress(0.85)
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  onProgress(0.97)
  return {
    blob: new Blob([out], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    rowCount: rows.length,
  }
}

export function ExportsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<ExportJob[]>(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const parsed: ExportJob[] = JSON.parse(raw)
        return parsed.map((j) => (j.status === 'ready' ? { ...j, status: 'expired' as const } : j))
      }
    } catch {
      /* ignore */
    }
    return []
  })
  const runtimes = useRef(new Map<string, JobRuntime>())

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(jobs.slice(0, 30)))
    } catch {
      /* ignore */
    }
  }, [jobs])

  const patch = useCallback((id: string, p: Partial<ExportJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...p } : j)))
  }, [])

  const run = useCallback(
    async (id: string, rt: JobRuntime, format: ExportFormat) => {
      patch(id, { status: 'preparing', progress: 0.02 })
      await new Promise((r) => setTimeout(r, 500))
      try {
        const { blob, rowCount } = await buildBlob(rt.filters, rt.sort, format, (p) =>
          patch(id, { progress: p }),
        )
        rt.blob = blob
        patch(id, { status: 'ready', progress: 1, rowCount })
      } catch (e) {
        patch(id, { status: 'error', error: e instanceof Error ? e.message : 'Ошибка формирования' })
      }
    },
    [patch],
  )

  const enqueue = useCallback(
    ({ title, summary, format, filters, sort }: EnqueueParams) => {
      const id = uid()
      const stamp = new Date().toISOString()
      const filename = `loyalty_operations_${stamp.slice(0, 19).replace(/[:T]/g, '-')}.${format}`
      const job: ExportJob = {
        id,
        title,
        summary,
        format,
        status: 'queued',
        progress: 0,
        rowCount: 0,
        createdAt: stamp,
        filename,
      }
      const rt: JobRuntime = { filters, sort }
      runtimes.current.set(id, rt)
      setJobs((prev) => [job, ...prev])
      void run(id, rt, format)
      return id
    },
    [run],
  )

  const download = useCallback((id: string) => {
    const rt = runtimes.current.get(id)
    const job = jobs.find((j) => j.id === id)
    if (!rt?.blob || !job) return
    const url = URL.createObjectURL(rt.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = job.filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 4000)
  }, [jobs])

  const regenerate = useCallback(
    (id: string) => {
      const rt = runtimes.current.get(id)
      const job = jobs.find((j) => j.id === id)
      if (!job) return
      if (!rt) {
        patch(id, { status: 'error', error: 'Параметры выгрузки утеряны после перезагрузки' })
        return
      }
      void run(id, rt, job.format)
    },
    [jobs, patch, run],
  )

  const remove = useCallback((id: string) => {
    runtimes.current.delete(id)
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }, [])

  const value = useMemo(
    () => ({ jobs, enqueue, download, remove, regenerate }),
    [jobs, enqueue, download, remove, regenerate],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useExports = () => useContext(Ctx)
