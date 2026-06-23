import { defineStore } from 'pinia'
import type { ScanRecord } from '@/composables/app-types'
import { normalizeScanRecord, sortScanRecords } from '@/composables/scan-record-utils'
import { useScanStorage } from '@/composables/useScanStorage'

interface ScansState {
  records: ScanRecord[]
  isLoading: boolean
  errorMessage: string | null
  successMessage: string | null
}

const scanStorage = useScanStorage()

export const useScansStore = defineStore('scans', {
  state: (): ScansState => ({
    records: [],
    isLoading: false,
    errorMessage: null,
    successMessage: null,
  }),
  getters: {
    recordById: (state) => {
      return (id: string) =>
        Array.isArray(state.records) ? state.records.find((record) => record.id === id) : undefined
    },
    recordByCode: (state) => {
      return (scanCode: string) =>
        Array.isArray(state.records)
          ? state.records.find((record) => record.scanCode === scanCode)
          : undefined
    },
  },
  actions: {
    async loadScanRecords() {
      this.isLoading = true
      this.errorMessage = null
      this.successMessage = null

      try {
        const records = await scanStorage.getScanRecords()

        this.records = sortScanRecords(
          Array.isArray(records)
            ? records.flatMap((record, index) => normalizeScanRecord(record, index) ?? [])
            : [],
        )
      } catch (error) {
        this.records = []
        this.errorMessage = error instanceof Error ? error.message : 'Could not load scan history.'
      } finally {
        this.isLoading = false
      }
    },
    async saveScanRecord(record: ScanRecord) {
      const normalizedRecord = normalizeScanRecord(record)

      if (!normalizedRecord) {
        this.errorMessage = 'Could not save this scan record.'
        this.successMessage = null
        return null
      }

      await scanStorage.saveScanRecord(normalizedRecord)
      this.records = sortScanRecords([
        normalizedRecord,
        ...(Array.isArray(this.records)
          ? this.records.filter((existingRecord) => existingRecord.id !== normalizedRecord.id)
          : []),
      ])
      this.errorMessage = null
      this.successMessage = 'Scan record saved.'

      return normalizedRecord
    },
    async updateScanRecord(id: string, updates: Partial<Pick<ScanRecord, 'alias' | 'note'>>) {
      const existingRecord = this.recordById(id)

      if (!existingRecord) {
        this.errorMessage = 'Scan record was not found.'
        this.successMessage = null
        return false
      }

      const nextRecord = normalizeScanRecord({
        ...existingRecord,
        alias: updates.alias?.trim() || existingRecord.alias,
        note:
          typeof updates.note === 'undefined' ? existingRecord.note : updates.note?.trim() || null,
        updatedAt: new Date().toISOString(),
      })

      if (!nextRecord) {
        this.errorMessage = 'Could not update this scan record.'
        this.successMessage = null
        return false
      }

      await this.saveScanRecord(nextRecord)
      this.successMessage = 'Scan details updated.'

      return true
    },
    async markScanRecordSaved(id: string, savedItemCount: number) {
      const existingRecord = this.recordById(id)

      if (!existingRecord) {
        return false
      }

      await this.saveScanRecord({
        ...existingRecord,
        savedItemCount: Math.max(0, Math.floor(savedItemCount)),
        status: 'saved',
        updatedAt: new Date().toISOString(),
      })

      return true
    },
  },
})
