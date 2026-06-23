import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useScannerStore } from '@/stores/scanner'

describe('scanner store', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(createPinia())
    vi.spyOn(console, 'info').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('keeps debug events disabled by default', () => {
    const scannerStore = useScannerStore()

    scannerStore.addDebugEvent('info', 'test-step', 'Testing debug event.', {
      value: 1,
    })

    expect(scannerStore.debugEvents).toHaveLength(0)
    expect(console.info).not.toHaveBeenCalled()
  })

  it('adds debug events and logs to the console when diagnostics are enabled', () => {
    const scannerStore = useScannerStore()

    scannerStore.setDiagnosticsEnabled(true)
    scannerStore.addDebugEvent('info', 'test-step', 'Testing debug event.', {
      value: 1,
    })

    expect(scannerStore.debugEvents).toHaveLength(1)
    expect(scannerStore.debugEvents[0]).toMatchObject({
      level: 'info',
      step: 'test-step',
      message: 'Testing debug event.',
    })
    expect(console.info).toHaveBeenCalledWith(
      '[Inventorie][Diagnostics][INFO] Testing debug event.',
      expect.objectContaining({
        step: 'test-step',
      }),
    )
  })

  it('updates progress state', () => {
    const scannerStore = useScannerStore()

    scannerStore.setProgress('Reading receipt', 0.55, 'recognize-text')

    expect(scannerStore.ocrStatus).toBe('Reading receipt')
    expect(scannerStore.ocrProgress).toBe(0.55)
    expect(scannerStore.ocrStep).toBe('recognize-text')
  })

  it('loads the sample scan without running OCR', async () => {
    const scannerStore = useScannerStore()

    await scannerStore.loadSampleReceipt()

    expect(scannerStore.rawOcrText.length).toBeGreaterThan(0)
    expect(scannerStore.detectedItems.length).toBeGreaterThan(0)
    expect(scannerStore.ocrProgress).toBe(1)
    expect(scannerStore.successMessage).toContain('Sample scan loaded')
    expect(scannerStore.activeScanRecord).toMatchObject({
      inputMethod: 'sample',
      status: 'completed',
      itemCount: scannerStore.detectedItems.length,
    })
  })
})
