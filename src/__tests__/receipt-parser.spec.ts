import { describe, expect, it } from 'vitest'
import { parseReceiptText } from '@/composables/useReceiptParser'
import { mockSampleReceipts } from '@/mocks/data/mock-sample-receipts'

describe('receipt-parser', () => {
  it('extracts known ingredients from Filipino grocery receipt text', () => {
    const items = parseReceiptText(mockSampleReceipts[0]?.ocrText ?? '')
    const ingredientIds = items.map((item) => item.ingredientId)

    expect(ingredientIds).toContain('ingredient-eggs')
    expect(ingredientIds).toContain('ingredient-rice')
    expect(ingredientIds).toContain('ingredient-chicken')
    expect(ingredientIds).toContain('ingredient-garlic')
    expect(ingredientIds).toContain('ingredient-soy-sauce')
    expect(ingredientIds).toContain('ingredient-vinegar')
    expect(ingredientIds).toContain('ingredient-cooking-oil')
  })

  it('extracts known ingredients from supermarket receipt text', () => {
    const items = parseReceiptText(mockSampleReceipts[1]?.ocrText ?? '')
    const displayNames = items.map((item) => item.displayName)
    const chicken = items.find((item) => item.ingredientId === 'ingredient-chicken')

    expect(displayNames).toContain('Chicken')
    expect(chicken?.description).toBe('Breast')
    expect(displayNames).toContain('Egg')
    expect(displayNames).toContain('Milk')
    expect(displayNames).toContain('Bread')
    expect(displayNames).toContain('Canned tuna')
    expect(displayNames).toContain('Tomato sauce')
  })

  it('handles messy OCR aliases and numeric noise', () => {
    const items = parseReceiptText(mockSampleReceipts[2]?.ocrText ?? '')
    const displayNames = items.map((item) => item.displayName)

    expect(displayNames).toContain('Onion')
    expect(displayNames).toContain('Potato')
    expect(displayNames).toContain('Yogurt')
    expect(displayNames).not.toContain('Payment Card')
  })

  it('ignores totals, tax, cash, card, and payment lines', () => {
    const items = parseReceiptText(`
      RECEIPT 00921
      INVOICE 5512
      DATE 06/18/2026
      TAX 12.00
      TOTAL 112.00
      CASH 200.00
      CARD APPROVAL 1129
      PAYMENT CARD
      BREAD 55.00
    `)

    expect(items).toHaveLength(1)
    expect(items[0]?.ingredientId).toBe('ingredient-bread')
  })

  it('keeps unknown grocery-like lines with lower confidence', () => {
    const items = parseReceiptText('DRAGON FRUIT 1PC 120.00')

    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      ingredientId: null,
      displayName: 'Dragon Fruit',
      selected: true,
    })
    expect(items[0]?.confidence).toBeLessThan(0.6)
  })

  it('ignores receipt headers, test labels, and footer text from the Mercado sample', () => {
    const items = parseReceiptText(`
      MERCADO MART
      OFFICIAL RECEIPT
      INVENTORIE SCAN TEST IMAGE
      DATE: 06/18/2026
      TIME: 14:22
      CASHIER: 003
      EGGS LARGE 12PCS          112.00
      CHICKEN BREAST 1KG        245.50
      GARLIC                     35.00
      WHITE RICE 5KG            330.00
      SUBTOTAL                  722.50
      VAT                        50.58
      TOTAL                     773.08
      CASH                     1000.00
      CHANGE                    226.92
      THANK YOU FOR SHOPPING
    `)
    const labels = items.map((item) => item.rawLabel.toLowerCase())
    const chicken = items.find((item) => item.ingredientId === 'ingredient-chicken')

    expect(items.map((item) => item.ingredientId)).toEqual([
      'ingredient-eggs',
      'ingredient-chicken',
      'ingredient-garlic',
      'ingredient-rice',
    ])
    expect(labels.some((label) => label.includes('inventorie scan test image'))).toBe(false)
    expect(labels.some((label) => label.includes('thank you for shopping'))).toBe(false)
    expect(chicken).toMatchObject({
      displayName: 'Chicken',
      description: 'Breast',
      quantity: 1,
      unit: 'kg',
    })
  })
})
