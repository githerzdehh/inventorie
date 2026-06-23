export interface ImagePreviewResult {
  dataUrl: string
  width: number
  height: number
  byteSize: number
}

interface ImagePreviewOptions {
  maxDimension?: number
  quality?: number
  maxRawFallbackBytes?: number
}

const defaultMaxDimension = 1600
const defaultQuality = 0.84
const defaultMaxRawFallbackBytes = 800_000

function getDataUrlByteSize(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? ''
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0

  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding)
}

function loadImage(objectUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not load image preview.'))
    image.src = objectUrl
  })
}

function readRawDataUrl(file: File, maxBytes: number): Promise<ImagePreviewResult | null> {
  if (
    file.size > maxBytes ||
    typeof FileReader === 'undefined' ||
    !file.type.startsWith('image/')
  ) {
    return Promise.resolve(null)
  }

  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : null

      resolve(
        dataUrl
          ? {
              dataUrl,
              width: 0,
              height: 0,
              byteSize: getDataUrlByteSize(dataUrl),
            }
          : null,
      )
    }
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

export async function createCompressedImagePreview(
  file: File | null,
  options: ImagePreviewOptions = {},
): Promise<ImagePreviewResult | null> {
  if (!file || !file.type.startsWith('image/')) {
    return null
  }

  const maxDimension = options.maxDimension ?? defaultMaxDimension
  const quality = options.quality ?? defaultQuality
  const maxRawFallbackBytes = options.maxRawFallbackBytes ?? defaultMaxRawFallbackBytes

  if (
    typeof document === 'undefined' ||
    typeof Image === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    return readRawDataUrl(file, maxRawFallbackBytes)
  }

  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(objectUrl)
    const sourceWidth = image.naturalWidth || image.width
    const sourceHeight = image.naturalHeight || image.height

    if (!sourceWidth || !sourceHeight) {
      return readRawDataUrl(file, maxRawFallbackBytes)
    }

    const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight))
    const width = Math.max(1, Math.round(sourceWidth * scale))
    const height = Math.max(1, Math.round(sourceHeight * scale))
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      return readRawDataUrl(file, maxRawFallbackBytes)
    }

    canvas.width = width
    canvas.height = height
    context.drawImage(image, 0, 0, width, height)

    const dataUrl = canvas.toDataURL('image/jpeg', quality)

    if (!dataUrl.startsWith('data:image/')) {
      return readRawDataUrl(file, maxRawFallbackBytes)
    }

    return {
      dataUrl,
      width,
      height,
      byteSize: getDataUrlByteSize(dataUrl),
    }
  } catch {
    return readRawDataUrl(file, maxRawFallbackBytes)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function formatImageByteSize(byteSize: number | null | undefined): string {
  if (!Number.isFinite(byteSize) || !byteSize) {
    return 'Not available'
  }

  if (byteSize < 1024 * 1024) {
    return `${Math.max(1, Math.round(byteSize / 1024))} KB`
  }

  return `${(byteSize / 1024 / 1024).toFixed(1)} MB`
}
