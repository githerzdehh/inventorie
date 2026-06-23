import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { gunzip } from 'node:zlib'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = join(projectRoot, 'public', 'ocr', 'tesseract')
const coreOutputRoot = join(outputRoot, 'core')
const languageOutputRoot = join(outputRoot, 'lang')
const tesseractRoot = join(projectRoot, 'node_modules', 'tesseract.js')
const tesseractCoreRoot = join(projectRoot, 'node_modules', 'tesseract.js-core')
const englishDataRoot = join(projectRoot, 'node_modules', '@tesseract.js-data', 'eng')
const gunzipBuffer = promisify(gunzip)

const coreFiles = [
  'tesseract-core-lstm.wasm.js',
  'tesseract-core-lstm.wasm',
  'tesseract-core-simd-lstm.wasm.js',
  'tesseract-core-simd-lstm.wasm',
  'tesseract-core-relaxedsimd-lstm.wasm.js',
  'tesseract-core-relaxedsimd-lstm.wasm',
]

await rm(outputRoot, { recursive: true, force: true })
await mkdir(coreOutputRoot, { recursive: true })
await mkdir(languageOutputRoot, { recursive: true })

await copyFile(join(tesseractRoot, 'dist', 'worker.min.js'), join(outputRoot, 'worker.min.js'))

for (const file of coreFiles) {
  await copyFile(join(tesseractCoreRoot, file), join(coreOutputRoot, file))
}

const englishData = await readFile(join(englishDataRoot, '4.0.0_best_int', 'eng.traineddata.gz'))
await writeFile(join(languageOutputRoot, 'eng.traineddata'), await gunzipBuffer(englishData))

console.log('Prepared offline OCR assets in public/ocr/tesseract')
