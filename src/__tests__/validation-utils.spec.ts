import { describe, expect, it } from 'vitest'
import { validateAndNormalizePhoneNumber } from '@/composables/phone-utils'
import { getQuantityInputMode, validateQuantityInput } from '@/composables/quantity-utils'

describe('quantity validation', () => {
  it('requires whole numbers for count-style units', () => {
    expect(validateQuantityInput('2', 'item')).toEqual({
      quantity: 2,
      errorMessage: null,
    })
    expect(validateQuantityInput('1.5', 'item')).toMatchObject({
      quantity: null,
      errorMessage: 'Quantity must be a whole number for this unit.',
    })
    expect(getQuantityInputMode('item')).toBe('numeric')
  })

  it('allows decimals for weight and volume units', () => {
    expect(validateQuantityInput('1.5', 'kg')).toEqual({
      quantity: 1.5,
      errorMessage: null,
    })
    expect(validateQuantityInput('250.75', 'ml')).toEqual({
      quantity: 250.75,
      errorMessage: null,
    })
    expect(getQuantityInputMode('ml')).toBe('decimal')
  })
})

describe('phone validation', () => {
  it('normalizes valid Philippine numbers to E.164', () => {
    expect(validateAndNormalizePhoneNumber('09171234567', 'PH')).toEqual({
      phoneNumber: '+639171234567',
      errorMessage: null,
    })
  })

  it('rejects non-Philippine numbers', () => {
    expect(validateAndNormalizePhoneNumber('+14155550100', 'PH')).toEqual({
      phoneNumber: null,
      errorMessage: 'Only Philippines (+63) phone numbers are allowed.',
    })
  })
})
