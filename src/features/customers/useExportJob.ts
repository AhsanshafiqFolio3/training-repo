import { useEffect, useRef, useState } from 'react'
import { wait } from '../../shared/wait'
import type { Customer } from '../../shared/types'
import { customerCsv, downloadCsv } from './export'

export type ExportStatus = 'idle' | 'running' | 'success' | 'error'
export interface ExportJob {
  status: ExportStatus
  start: (rows: readonly Customer[], simulateFailure: boolean) => void
  download: () => void
  dismiss: () => void
}
const EXPORT_DELAY_MS = 1300

export function useExportJob(): ExportJob {
  const [status, setStatus] = useState<ExportStatus>('idle')
  const [content, setContent] = useState('')
  const running = useRef<AbortController | null>(null)
  useEffect(
    () => (): void => {
      running.current?.abort()
    },
    [],
  )
  async function run(rows: readonly Customer[], simulateFailure: boolean): Promise<void> {
    if (running.current) return
    const controller = new AbortController()
    running.current = controller
    const snapshot = customerCsv(rows)
    setStatus('running')
    try {
      await wait(EXPORT_DELAY_MS, controller.signal)
      if (simulateFailure) {
        setStatus('error')
        return
      }
      setContent(snapshot)
      setStatus('success')
    } catch {
      return
    } finally {
      if (running.current === controller) running.current = null
    }
  }
  return {
    status,
    start: (rows, simulateFailure) => {
      void run(rows, simulateFailure)
    },
    download: () => downloadCsv(content),
    dismiss: () => setStatus('idle'),
  }
}
