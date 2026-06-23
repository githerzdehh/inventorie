import type { DebugEventLevel } from '@/composables/app-types'

const maxOcrImageWidth = 1500
const ocrTimeoutMs = 120_000

type OcrImageInput = File | Blob | string | HTMLCanvasElement

type TesseractLoggerMessage = {
  status?: string
  progress?: number
}

type TesseractWorker = {
  recognize: (image: OcrImageInput) => Promise<{
    data: {
      text: string
      confidence: number
    }
  }>
  terminate?: () => Promise<unknown>
}

type CreateWorker = (
  language?: string,
  oem?: unknown,
  options?: TesseractWorkerOptions,
) => Promise<TesseractWorker>

type TesseractWorkerOptions = {
  logger?: (message: TesseractLoggerMessage) => void
  errorHandler?: (error: unknown) => void
  workerPath?: string
  corePath?: string
  langPath?: string
  cachePath?: string
  cacheMethod?: 'write' | 'readOnly' | 'refresh' | 'none'
  workerBlobURL?: boolean
  gzip?: boolean
}

interface TesseractModule {
  default?: {
    createWorker?: CreateWorker
    recognize?: (
      image: OcrImageInput,
      langs?: string,
      options?: TesseractWorkerOptions,
    ) => Promise<{
      data: {
        text: string
        confidence: number
      }
    }>
  }
  createWorker?: CreateWorker
  recognize?: (
    image: OcrImageInput,
    langs?: string,
    options?: TesseractWorkerOptions,
  ) => Promise<{
    data: {
      text: string
      confidence: number
    }
  }>
}

interface OpenCvLike {
  imread?: (image: HTMLImageElement | HTMLCanvasElement) => unknown
  imshow?: (canvas: HTMLCanvasElement | string, source: unknown) => void
  cvtColor?: (source: unknown, destination: unknown, code: number) => void
  threshold?: (
    source: unknown,
    destination: unknown,
    threshold: number,
    maxValue: number,
    type: number,
  ) => void
  COLOR_RGBA2GRAY?: number
  THRESH_BINARY?: number
}

interface DeletableMat {
  delete?: () => void
}

export interface OcrProgressUpdate {
  status: string
  progress: number
  step: string
  data?: unknown
}

export interface OcrScanOptions {
  timeoutMs?: number
  onProgress?: (update: OcrProgressUpdate) => void
  onDebug?: (level: DebugEventLevel, step: string, message: string, data?: unknown) => void
}

export interface OcrScanResult {
  text: string
  confidence: number
  processedImageUrl: string | null
  originalSize: {
    width: number
    height: number
  } | null
  resizedSize: {
    width: number
    height: number
  } | null
}

interface PreparedImage {
  image: OcrImageInput
  previewUrl: string | null
  originalSize: {
    width: number
    height: number
  } | null
  resizedSize: {
    width: number
    height: number
  } | null
}

class OcrTimeoutError extends Error {
  constructor() {
    super('Image scanning is taking too long. Try a clearer or smaller source image.')
    this.name = 'OcrTimeoutError'
  }
}

function resolveBrowserAssetUrl(path: string): string {
  if (typeof window === 'undefined') {
    return path
  }

  return new URL(path, window.location.origin).href
}

function getTesseractWorkerOptions(
  options: OcrScanOptions,
  logger: (message: TesseractLoggerMessage) => void,
): TesseractWorkerOptions {
  return {
    workerPath: resolveBrowserAssetUrl('/ocr/tesseract/worker.min.js'),
    corePath: resolveBrowserAssetUrl('/ocr/tesseract/core'),
    langPath: resolveBrowserAssetUrl('/ocr/tesseract/lang'),
    cachePath: 'inventorie-ocr',
    workerBlobURL: false,
    gzip: false,
    logger,
    errorHandler: (error) => {
      emitDebug(options, 'warning', 'tesseract', 'Tesseract reported a worker warning.', error)
    },
  }
}

function emitProgress(
  options: OcrScanOptions,
  status: string,
  progress: number,
  step: string,
  data?: unknown,
) {
  options.onProgress?.({
    status,
    progress: Math.max(0, Math.min(1, progress)),
    step,
    data,
  })
}

function emitDebug(
  options: OcrScanOptions,
  level: DebugEventLevel,
  step: string,
  message: string,
  data?: unknown,
) {
  options.onDebug?.(level, step, message, data)
}

async function importOpenCvModule(): Promise<({ default?: OpenCvLike } & OpenCvLike) | null> {
  try {
    const dynamicImport = new Function('specifier', 'return import(specifier)') as (
      specifier: string,
    ) => Promise<unknown>

    return (await dynamicImport('@techstark/opencv-js')) as { default?: OpenCvLike } & OpenCvLike
  } catch {
    return null
  }
}

function normalizeTesseractStatus(status?: string): string {
  if (!status) {
    return 'Reading image'
  }

  const normalizedStatus = status.toLowerCase()

  if (normalizedStatus.includes('language') || normalizedStatus.includes('traineddata')) {
    return 'Getting scanner ready'
  }

  if (normalizedStatus.includes('recognizing')) {
    return 'Reading image'
  }

  if (normalizedStatus.includes('initializ') || normalizedStatus.includes('loading')) {
    return 'Starting image scan'
  }

  return 'Scanning image'
}

async function loadImageFromFile(file: File | Blob): Promise<HTMLImageElement> {
  const imageUrl = URL.createObjectURL(file)

  try {
    const image = new Image()
    image.src = imageUrl

    if (image.decode) {
      await image.decode()
    } else {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new Error('Could not load source image.'))
      })
    }

    return image
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

function imageToCanvas(image: HTMLImageElement, maxWidth = maxOcrImageWidth): HTMLCanvasElement {
  const originalWidth = image.naturalWidth || image.width
  const originalHeight = image.naturalHeight || image.height
  const scale = originalWidth > maxWidth ? maxWidth / originalWidth : 1
  const canvas = document.createElement('canvas')

  canvas.width = Math.max(1, Math.round(originalWidth * scale))
  canvas.height = Math.max(1, Math.round(originalHeight * scale))

  const context = canvas.getContext('2d')
  context?.drawImage(image, 0, 0, canvas.width, canvas.height)

  return canvas
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/jpeg', 0.9)
  })

  if (!blob) {
    throw new Error('Could not prepare source image for scanning.')
  }

  return blob
}

async function downscaleImage(file: File, options: OcrScanOptions): Promise<PreparedImage> {
  if (typeof document === 'undefined') {
    return {
      image: file,
      previewUrl: null,
      originalSize: null,
      resizedSize: null,
    }
  }

  emitProgress(options, 'Preparing image', 0.12, 'image-downscale')

  try {
    const image = await loadImageFromFile(file)
    const originalSize = {
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
    }
    const canvas = imageToCanvas(image)
    const resizedSize = {
      width: canvas.width,
      height: canvas.height,
    }

    if (originalSize.width === resizedSize.width && originalSize.height === resizedSize.height) {
      emitDebug(options, 'info', 'image-downscale', 'Image is already within OCR size limits.', {
        originalSize,
        resizedSize,
      })

      return {
        image: file,
        previewUrl: null,
        originalSize,
        resizedSize,
      }
    }

    const resizedBlob = await canvasToBlob(canvas)
    const previewUrl = URL.createObjectURL(resizedBlob)

    emitDebug(options, 'success', 'image-downscale', 'Image downscaled for OCR.', {
      originalSize,
      resizedSize,
    })

    return {
      image: resizedBlob,
      previewUrl,
      originalSize,
      resizedSize,
    }
  } catch (error) {
    emitDebug(
      options,
      'warning',
      'image-downscale',
      'Image downscaling failed. Using original image.',
      {
        error: error instanceof Error ? error.message : String(error),
      },
    )

    return {
      image: file,
      previewUrl: null,
      originalSize: null,
      resizedSize: null,
    }
  }
}

async function preprocessWithOpenCv(
  preparedImage: PreparedImage,
  options: OcrScanOptions,
): Promise<PreparedImage> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return preparedImage
  }

  emitProgress(options, 'Preparing image', 0.18, 'opencv-preprocess')

  try {
    const cvModule = await importOpenCvModule()

    if (!cvModule) {
      emitDebug(
        options,
        'warning',
        'opencv-preprocess',
        'OpenCV import failed. Continuing without preprocessing.',
      )
      return preparedImage
    }

    const cv = cvModule.default ?? cvModule

    if (!cv.imread || !cv.imshow || !cv.cvtColor || !cv.threshold) {
      emitDebug(
        options,
        'warning',
        'opencv-preprocess',
        'OpenCV is unavailable. Continuing without preprocessing.',
      )
      return preparedImage
    }

    const image =
      preparedImage.image instanceof Blob || preparedImage.image instanceof File
        ? await loadImageFromFile(preparedImage.image)
        : null

    if (!image) {
      return preparedImage
    }

    const sourceCanvas = imageToCanvas(image, maxOcrImageWidth)
    const outputCanvas = document.createElement('canvas')
    const source = cv.imread(sourceCanvas) as DeletableMat
    const destination = cv.imread(sourceCanvas) as DeletableMat

    try {
      cv.cvtColor(source, destination, cv.COLOR_RGBA2GRAY ?? 0)
      cv.threshold(destination, destination, 0, 255, cv.THRESH_BINARY ?? 0)
      cv.imshow(outputCanvas, destination)

      const blob = await canvasToBlob(outputCanvas)
      const previousPreviewUrl = preparedImage.previewUrl
      const previewUrl = URL.createObjectURL(blob)

      if (previousPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previousPreviewUrl)
      }

      emitDebug(options, 'success', 'opencv-preprocess', 'Optional OpenCV preprocessing completed.')

      return {
        ...preparedImage,
        image: blob,
        previewUrl,
        resizedSize: {
          width: outputCanvas.width,
          height: outputCanvas.height,
        },
      }
    } finally {
      source.delete?.()
      destination.delete?.()
    }
  } catch (error) {
    emitDebug(
      options,
      'warning',
      'opencv-preprocess',
      'OpenCV preprocessing failed. Continuing without it.',
      {
        error: error instanceof Error ? error.message : String(error),
      },
    )

    return preparedImage
  }
}

async function recognizeWithTesseract(image: OcrImageInput, options: OcrScanOptions) {
  emitProgress(options, 'Starting image scan', 0.25, 'ocr-worker')

  const tesseractModule = (await import('tesseract.js')) as unknown as TesseractModule
  const createWorker = tesseractModule.createWorker ?? tesseractModule.default?.createWorker
  const recognize = tesseractModule.recognize ?? tesseractModule.default?.recognize
  let worker: TesseractWorker | null = null

  const ocrPromise = (async () => {
    if (createWorker) {
      const workerOptions = getTesseractWorkerOptions(options, (message) => {
        const progress = typeof message.progress === 'number' ? message.progress : 0
        const status = normalizeTesseractStatus(message.status)

        emitProgress(options, status, 0.25 + progress * 0.7, 'tesseract', message)
        emitDebug(options, 'info', 'tesseract', status, message)
      })
      worker = await createWorker('eng', undefined, workerOptions)

      const result = await worker.recognize(image)
      await worker.terminate?.()
      worker = null

      return result
    }

    if (!recognize) {
      throw new Error('Image scanner is unavailable.')
    }

    emitDebug(
      options,
      'warning',
      'ocr-worker',
      'Tesseract worker unavailable. Using direct recognize fallback.',
    )
    return recognize(
      image,
      'eng',
      getTesseractWorkerOptions(options, (message) => {
        const progress = typeof message.progress === 'number' ? message.progress : 0
        const status = normalizeTesseractStatus(message.status)

        emitProgress(options, status, 0.25 + progress * 0.7, 'tesseract', message)
        emitDebug(options, 'info', 'tesseract', status, message)
      }),
    )
  })()

  let timeoutId: ReturnType<typeof setTimeout> | null = null
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = globalThis.setTimeout(async () => {
      try {
        await worker?.terminate?.()
      } finally {
        worker = null
        reject(new OcrTimeoutError())
      }
    }, options.timeoutMs ?? ocrTimeoutMs)
  })

  try {
    return await Promise.race([ocrPromise, timeoutPromise])
  } finally {
    if (timeoutId) {
      globalThis.clearTimeout(timeoutId)
    }
  }
}

export async function scanReceiptImage(
  file: File,
  options: OcrScanOptions = {},
): Promise<OcrScanResult> {
  emitDebug(options, 'info', 'ocr-start', 'Starting OCR.', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  })
  emitProgress(options, 'Preparing image', 0.05, 'prepare-image')

  let preparedImage = await downscaleImage(file, options)
  preparedImage = await preprocessWithOpenCv(preparedImage, options)

  emitProgress(options, 'Reading image', 0.3, 'recognize-text')
  const result = await recognizeWithTesseract(preparedImage.image, options)
  const confidence = Math.max(0, Math.min(100, result.data.confidence)) / 100

  emitProgress(options, 'Completed', 1, 'completed')
  emitDebug(options, 'success', 'ocr-complete', 'OCR completed.', {
    confidence,
    textLength: result.data.text.length,
  })

  return {
    text: result.data.text,
    confidence,
    processedImageUrl: preparedImage.previewUrl,
    originalSize: preparedImage.originalSize,
    resizedSize: preparedImage.resizedSize,
  }
}

export function useOcrScanner() {
  return {
    scanReceiptImage,
  }
}
