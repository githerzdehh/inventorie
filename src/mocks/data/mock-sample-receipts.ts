import type { SampleReceipt } from '@/composables/app-types'

export const mockSampleReceipts = [
  {
    id: 'receipt-filipino-grocery',
    storeName: 'Suki Mart',
    purchasedAt: '2026-06-15T10:30:00.000Z',
    ocrText: `
SUKI MART BRANCH 02
Date 06/15/2026 Time 10:30
Cashier 004
ITLOG LARGE 12CT       118.50
BIGAS JASMINE 5KG      365.00
MANOK WHOLE 1.2KG      220.00
BAWANG 250G             42.00
SIBUYAS RED 500G        68.00
KAMATIS 500G            54.00
TOYO 1L                 82.00
SUKA CANE 1L            70.00
MANTIKA 1L             118.00
SUBTOTAL              1137.50
VAT                    136.50
TOTAL PHP             1274.00
CASH                  1500.00
CHANGE                 226.00
Reference 8273-1002
`,
  },
  {
    id: 'receipt-general-supermarket',
    storeName: 'Neighborhood Supermarket',
    purchasedAt: '2026-06-16T17:45:00.000Z',
    ocrText: `
NEIGHBORHOOD SUPERMARKET
Receipt 009412
CHICKEN BREAST 1KG       310.00
EGGS LARGE 12 CT         135.00
MILK WHOLE 1L             95.00
BREAD WHEAT LOAF          72.00
CARROTS 1 BAG             64.00
BROCCOLI HEAD             88.00
CANNED TUNA 2 CAN        112.00
TOMATO SAUCE PACK         39.00
CARD APPROVAL 1902
TAX                       74.10
TOTAL                    989.10
`,
  },
  {
    id: 'receipt-messy-ocr',
    storeName: 'Messy OCR Sample',
    purchasedAt: '2026-06-17T09:10:00.000Z',
    ocrText: `
*** GR0CERY VAULT ***
INV 77801 STORE #12
0N10N YELL0W       P 45.0O
P0TATO 1KG          88.OO
CABBAGE HEAD        76.5O
CUCUMBER            31.OO
PECHAY BUNDLE       24.OO
CHEESE SLICES       91.0O
Y0GURT CUP          48.O0
SARDINES CAN        32.OO
SALT IODIZED        19.OO
BLACK PEPPER        28.OO
00002939293
PAYMENT CARD
TOTAL 482.50
`,
  },
] satisfies SampleReceipt[]
