import { defineStore } from 'pinia'
import type {
  DebugEventLevel,
  DetectedReceiptItem,
  ScanInputMethod,
  ScanRecord,
  ScannerDebugEvent,
} from '@/composables/app-types'
import {
  createCompressedImagePreview,
  type ImagePreviewResult,
} from '@/composables/image-preview-utils'
import {
  makeDefaultScanAlias,
  makeScanCode,
  makeScanRecordId,
} from '@/composables/scan-record-utils'
import { scanReceiptImage } from '@/composables/useOcrScanner'
import { parseReceiptText } from '@/composables/useReceiptParser'
import { useScanStorage } from '@/composables/useScanStorage'
import { mockSampleReceipts } from '@/mocks/data/mock-sample-receipts'

interface ScannerState {
  uploadedImageUrl: string | null
  uploadedFile: File | null
  uploadedInputMethod: ScanInputMethod | null
  processedImageUrl: string | null
  originalImageSize: {
    width: number
    height: number
  } | null
  ocrImageSize: {
    width: number
    height: number
  } | null
  rawOcrText: string
  ocrConfidence: number
  detectedItems: DetectedReceiptItem[]
  isProcessing: boolean
  errorMessage: string | null
  successMessage: string | null
  ocrProgress: number
  ocrStatus: string
  ocrStep: string
  startedAt: string | null
  completedAt: string | null
  elapsedMs: number
  debugEvents: ScannerDebugEvent[]
  diagnosticsEnabled: boolean
  activeScanRecord: ScanRecord | null
  sourceImagePreview: ImagePreviewResult | null
}

interface ProcessReceiptResult {
  success: boolean
  itemCount: number
  errorMessage: string | null
}

interface ScannerDiagnosticsOptions {
  diagnosticsEnabled?: boolean
  inputMethod?: ScanInputMethod
}

const scanStorage = useScanStorage()

function makeDebugEventId(): string {
  if (globalThis.crypto?.randomUUID) {
    return `debug-${globalThis.crypto.randomUUID()}`
  }

  return `debug-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function revokeObjectUrl(url: string | null): void {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

function getElapsedMs(startedAt: string | null): number {
  if (!startedAt) {
    return 0
  }

  return Math.max(0, Date.now() - new Date(startedAt).getTime())
}

function getOriginalFileName(file: File | null, inputMethod: ScanInputMethod): string | null {
  if (file?.name) {
    return file.name
  }

  return inputMethod === 'sample' ? 'Sample source image' : null
}

export const useScannerStore = defineStore('scanner', {
  state: (): ScannerState => ({
    uploadedImageUrl: null,
    uploadedFile: null,
    uploadedInputMethod: null,
    processedImageUrl: null,
    originalImageSize: null,
    ocrImageSize: null,
    rawOcrText: '',
    ocrConfidence: 0,
    detectedItems: [],
    isProcessing: false,
    errorMessage: null,
    successMessage: null,
    ocrProgress: 0,
    ocrStatus: 'Ready',
    ocrStep: 'idle',
    startedAt: null,
    completedAt: null,
    elapsedMs: 0,
    debugEvents: [],
    diagnosticsEnabled: false,
    activeScanRecord: null,
    sourceImagePreview: null,
  }),
  actions: {
    setDiagnosticsEnabled(enabled: boolean) {
      this.diagnosticsEnabled = enabled

      if (!enabled) {
        this.clearDebugEvents()
      }
    },
    addDebugEvent(level: DebugEventLevel, step: string, message: string, data?: unknown) {
      if (!this.diagnosticsEnabled) {
        return
      }

      const event: ScannerDebugEvent = {
        id: makeDebugEventId(),
        timestamp: new Date().toISOString(),
        level,
        step,
        message,
        data,
      }
      const consoleMessage = `[Inventorie][Diagnostics][${level.toUpperCase()}] ${message}`
      const consoleData = {
        step,
        data,
      }

      this.debugEvents.unshift(event)

      if (level === 'error') {
        console.error(consoleMessage, consoleData)
      } else if (level === 'warning') {
        console.warn(consoleMessage, consoleData)
      } else {
        console.info(consoleMessage, consoleData)
      }
    },
    clearDebugEvents() {
      this.debugEvents = []
    },
    setProgress(status: string, progress: number, step?: string) {
      this.ocrStatus = status
      this.ocrProgress = Math.max(0, Math.min(1, progress))
      this.ocrStep = step ?? this.ocrStep
      this.elapsedMs = getElapsedMs(this.startedAt)
    },
    setError(message: string) {
      this.errorMessage = message
      this.successMessage = null
      this.completedAt = new Date().toISOString()
      this.elapsedMs = getElapsedMs(this.startedAt)
      this.setProgress('Scan failed', this.ocrProgress, 'failed')
      this.addDebugEvent('error', 'failed', message)
    },
    setSuccess(message: string) {
      this.successMessage = message
      this.errorMessage = null
      this.completedAt = new Date().toISOString()
      this.elapsedMs = getElapsedMs(this.startedAt)
      this.setProgress('Scan completed', 1, 'completed')
      this.addDebugEvent('success', 'completed', message)
    },
    setUploadedImage(file: File | null, options: ScannerDiagnosticsOptions = {}) {
      if (typeof options.diagnosticsEnabled === 'boolean') {
        this.setDiagnosticsEnabled(options.diagnosticsEnabled)
      }

      if (this.isProcessing) {
        this.addDebugEvent('warning', 'upload-blocked', 'Upload ignored because a scan is running.')
        return
      }

      revokeObjectUrl(this.uploadedImageUrl)
      revokeObjectUrl(this.processedImageUrl)

      this.uploadedFile = file
      this.uploadedInputMethod = file ? (options.inputMethod ?? 'upload') : null
      this.uploadedImageUrl = file ? URL.createObjectURL(file) : null
      this.processedImageUrl = null
      this.originalImageSize = null
      this.ocrImageSize = null
      this.sourceImagePreview = null
      this.rawOcrText = ''
      this.ocrConfidence = 0
      this.detectedItems = []
      this.errorMessage = null
      this.successMessage = null
      this.ocrProgress = 0
      this.ocrStatus = file ? 'Ready to process' : 'Ready'
      this.ocrStep = file ? 'image-selected' : 'idle'
      this.startedAt = null
      this.completedAt = null
      this.elapsedMs = 0
      this.activeScanRecord = null

      if (file) {
        this.addDebugEvent('info', 'image-selected', 'Source image selected.', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          inputMethod: this.uploadedInputMethod,
        })
      }
    },
    async processReceipt(
      fileOrImage?: File | null,
      options: ScannerDiagnosticsOptions = {},
    ): Promise<ProcessReceiptResult> {
      if (typeof options.diagnosticsEnabled === 'boolean') {
        this.setDiagnosticsEnabled(options.diagnosticsEnabled)
      }

      if (this.isProcessing) {
        const errorMessage = 'Scan processing is already running.'
        this.addDebugEvent('warning', 'processing-active', errorMessage)

        return {
          success: false,
          itemCount: this.detectedItems.length,
          errorMessage,
        }
      }

      if (fileOrImage) {
        this.setUploadedImage(fileOrImage, options)
      }

      if (!this.uploadedFile) {
        const errorMessage = 'Upload or capture a source image first.'
        this.setError(errorMessage)

        return {
          success: false,
          itemCount: 0,
          errorMessage,
        }
      }

      revokeObjectUrl(this.processedImageUrl)
      this.isProcessing = true
      this.errorMessage = null
      this.successMessage = null
      this.rawOcrText = ''
      this.ocrConfidence = 0
      this.detectedItems = []
      this.processedImageUrl = null
      this.originalImageSize = null
      this.ocrImageSize = null
      this.startedAt = new Date().toISOString()
      this.completedAt = null
      this.elapsedMs = 0
      this.activeScanRecord = null
      this.setProgress('Preparing source image', 0.02, 'start')
      this.addDebugEvent('info', 'start', 'Starting OCR.')

      try {
        const ocrResult = await scanReceiptImage(this.uploadedFile, {
          onProgress: ({ status, progress, step, data }) => {
            this.setProgress(status, progress, step)
            this.addDebugEvent('info', step, status, data)
          },
          onDebug: (level, step, message, data) => {
            this.addDebugEvent(level, step, message, data)
          },
        })

        this.rawOcrText = ocrResult.text
        this.ocrConfidence = ocrResult.confidence
        this.processedImageUrl = ocrResult.processedImageUrl
        this.originalImageSize = ocrResult.originalSize
        this.ocrImageSize = ocrResult.resizedSize
        this.setProgress('Reviewing scan items', 0.96, 'parse-items')
        this.addDebugEvent('info', 'parse-items', 'Parsing items from recognized text.', {
          textLength: ocrResult.text.length,
          confidence: ocrResult.confidence,
        })
        this.detectedItems = parseReceiptText(ocrResult.text)

        if (!this.detectedItems.length) {
          const message =
            'Scan completed, but no grocery items were detected. Try a clearer source image.'
          this.completedAt = new Date().toISOString()
          this.elapsedMs = getElapsedMs(this.startedAt)
          this.setProgress('Scan completed with no detected items', 1, 'completed')
          this.successMessage = message
          this.addDebugEvent('warning', 'parse-items', message, {
            ocrTextLength: this.rawOcrText.length,
          })
          await this.saveCurrentScanRecord('completed_empty', 0)

          return {
            success: false,
            itemCount: 0,
            errorMessage: null,
          }
        }

        const message = `Scan processed. ${this.detectedItems.length} possible item${
          this.detectedItems.length === 1 ? '' : 's'
        } found.`
        this.setSuccess(message)
        await this.saveCurrentScanRecord('completed', this.detectedItems.length)

        return {
          success: true,
          itemCount: this.detectedItems.length,
          errorMessage: null,
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Could not process the source image. Try a clearer or smaller image.'
        this.detectedItems = []
        this.setError(errorMessage)
        await this.saveCurrentScanRecord('failed', 0)

        return {
          success: false,
          itemCount: 0,
          errorMessage,
        }
      } finally {
        this.isProcessing = false
        this.elapsedMs = getElapsedMs(this.startedAt)
      }
    },
    async loadSampleReceipt() {
      const sampleReceipt = mockSampleReceipts[0]

      if (!sampleReceipt) {
        this.setError('No sample scan is available.')
        return
      }

      if (this.isProcessing) {
        this.addDebugEvent(
          'warning',
          'sample-blocked',
          'Sample scan ignored because a scan is running.',
        )
        return
      }

      this.clearScannerState()
      this.startedAt = new Date().toISOString()
      this.uploadedInputMethod = 'sample'
      this.rawOcrText = sampleReceipt.ocrText
      this.ocrConfidence = 0.98
      this.detectedItems = parseReceiptText(sampleReceipt.ocrText)
      this.setProgress('Scan completed', 1, 'sample-receipt')
      this.setSuccess(`Sample scan loaded. ${this.detectedItems.length} possible items found.`)
      this.addDebugEvent('info', 'sample-receipt', 'Loaded development sample receipt.', {
        receiptId: sampleReceipt.id,
        storeName: sampleReceipt.storeName,
        itemCount: this.detectedItems.length,
      })
      await this.saveCurrentScanRecord('completed', this.detectedItems.length)
    },
    clearScannerState() {
      if (this.isProcessing) {
        this.addDebugEvent('warning', 'clear-blocked', 'Clear ignored because a scan is running.')
        return
      }

      revokeObjectUrl(this.uploadedImageUrl)
      revokeObjectUrl(this.processedImageUrl)

      this.uploadedImageUrl = null
      this.uploadedFile = null
      this.uploadedInputMethod = null
      this.processedImageUrl = null
      this.originalImageSize = null
      this.ocrImageSize = null
      this.sourceImagePreview = null
      this.rawOcrText = ''
      this.ocrConfidence = 0
      this.detectedItems = []
      this.errorMessage = null
      this.successMessage = null
      this.ocrProgress = 0
      this.ocrStatus = 'Ready'
      this.ocrStep = 'idle'
      this.startedAt = null
      this.completedAt = null
      this.elapsedMs = 0
      this.activeScanRecord = null
      this.sourceImagePreview = null
      this.clearDebugEvents()
    },
    async saveCurrentScanRecord(status: ScanRecord['status'], itemCount: number) {
      const inputMethod = this.uploadedInputMethod ?? 'upload'
      const scannedAt = this.startedAt ?? new Date().toISOString()
      const completedAt = this.completedAt ?? new Date().toISOString()
      const imagePreview =
        this.sourceImagePreview ?? (await createCompressedImagePreview(this.uploadedFile))

      this.sourceImagePreview = imagePreview

      const record: ScanRecord = {
        id: makeScanRecordId(),
        scanCode: makeScanCode(scannedAt),
        alias: makeDefaultScanAlias(inputMethod, scannedAt),
        note: null,
        inputMethod,
        originalFileName: getOriginalFileName(this.uploadedFile, inputMethod),
        imagePreviewDataUrl: imagePreview?.dataUrl ?? null,
        imagePreviewWidth: imagePreview?.width ?? null,
        imagePreviewHeight: imagePreview?.height ?? null,
        imagePreviewByteSize: imagePreview?.byteSize ?? null,
        scannedAt,
        completedAt,
        itemCount: Math.max(0, Math.floor(itemCount)),
        savedItemCount: 0,
        ocrConfidence: this.ocrConfidence,
        status,
        createdAt: scannedAt,
        updatedAt: completedAt,
      }

      await scanStorage.saveScanRecord(record)
      this.activeScanRecord = record
      this.addDebugEvent('info', 'scan-record', 'Saved scan record.', {
        scanCode: record.scanCode,
        status: record.status,
      })

      return record
    },
    async markActiveScanRecordSaved(savedItemCount: number) {
      if (!this.activeScanRecord) {
        return null
      }

      const updatedAt = new Date().toISOString()
      const record: ScanRecord = {
        ...this.activeScanRecord,
        savedItemCount: Math.max(0, Math.floor(savedItemCount)),
        status: 'saved',
        updatedAt,
      }

      await scanStorage.saveScanRecord(record)
      this.activeScanRecord = record

      return record
    },
    updateDetectedItem(id: string, updates: Partial<DetectedReceiptItem>) {
      const detectedItem = this.detectedItems.find((item) => item.id === id)

      if (!detectedItem) {
        return
      }

      Object.assign(detectedItem, updates)
    },
    removeDetectedItem(id: string) {
      this.detectedItems = this.detectedItems.filter((item) => item.id !== id)
      this.addDebugEvent('info', 'review-items', 'Removed a detected item.', { id })
    },
    toggleDetectedItem(id: string) {
      const detectedItem = this.detectedItems.find((item) => item.id === id)

      if (!detectedItem) {
        return
      }

      detectedItem.selected = !detectedItem.selected
    },
  },
})
