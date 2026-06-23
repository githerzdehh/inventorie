import type { AppNotification } from '@/stores/notifications'
import type { FreshnessStatus, PantryItem } from '@/composables/app-types'

export interface MockFoodItem {
  id: string
  ingredientId: string
  displayName: string
  category: string
  icon: string
  description: string
  quantity: number
  unit: string
  unitPricePhp: number
  purchaseDate: string
  expiryDate: string
  lowStockQuantity: number
  boughtFrom: string
  freshnessStatus: FreshnessStatus
}

export interface MockComparisonProfile {
  id: string
  displayName: string
  avatarColor: string
  friends: number
  inventoryCount: number
  badge: string
  badgeIcon: string
  recipeCount: number
  savedCount: number
  donatedCount: number
  wastedCount: number
  savedValuePhp: number
  wasteAvoidedKg: number
  noWasteStreakDays: number
}

export interface MockPlan {
  id: string
  name: string
  price: string
  cadence: string
  cta: string
  featured?: boolean
}

export interface MockPlanFeature {
  label: string
  basic: boolean
  unbasic: boolean
}

export interface MockLanguageOption {
  code: string
  label: string
  flag: string
}

export interface MockCurrencyOption {
  code: string
  name: string
  flag: string
  symbol: string
}

export interface MockSupportTopic {
  value: string
  title: string
}

const createdAt = '2026-06-23T08:00:00.000Z'

export const mockFoodItems: MockFoodItem[] = [
  {
    id: 'mock-mango',
    ingredientId: 'ingredient-mango',
    displayName: 'Mango',
    category: 'Fruits',
    icon: '🥭',
    description: 'Ripe yellow mango',
    quantity: 0.5,
    unit: 'kg/s',
    unitPricePhp: 50,
    purchaseDate: '2026-06-23',
    expiryDate: '2026-06-28',
    lowStockQuantity: 0.25,
    boughtFrom: 'SM Supermarket',
    freshnessStatus: 'use-soon',
  },
  {
    id: 'mock-lemon',
    ingredientId: 'ingredient-lemon',
    displayName: 'Lemon',
    category: 'Fruits',
    icon: '🍋',
    description: 'Fresh lemons',
    quantity: 0.2,
    unit: 'kg/s',
    unitPricePhp: 25,
    purchaseDate: '2026-06-23',
    expiryDate: '2026-07-09',
    lowStockQuantity: 0.4,
    boughtFrom: 'FreshMart',
    freshnessStatus: 'fresh',
  },
  {
    id: 'mock-apple',
    ingredientId: 'ingredient-apple',
    displayName: 'Apple',
    category: 'Fruits',
    icon: '🍎',
    description: 'Red apple',
    quantity: 0.5,
    unit: 'kg/s',
    unitPricePhp: 75,
    purchaseDate: '2026-06-23',
    expiryDate: '2026-07-09',
    lowStockQuantity: 0.3,
    boughtFrom: 'FreshMart',
    freshnessStatus: 'fresh',
  },
  {
    id: 'mock-grapes',
    ingredientId: 'ingredient-grapes',
    displayName: 'Purple Grapes',
    category: 'Fruits',
    icon: '🍇',
    description: 'Seedless grapes',
    quantity: 0.3,
    unit: 'kg/s',
    unitPricePhp: 105,
    purchaseDate: '2026-06-21',
    expiryDate: '2026-06-30',
    lowStockQuantity: 0.2,
    boughtFrom: 'Suki Mart',
    freshnessStatus: 'use-soon',
  },
  {
    id: 'mock-banana',
    ingredientId: 'ingredient-banana',
    displayName: 'Banana',
    category: 'Fruits',
    icon: '🍌',
    description: 'Lakatan banana',
    quantity: 0.7,
    unit: 'kg/s',
    unitPricePhp: 120,
    purchaseDate: '2026-06-21',
    expiryDate: '2026-06-30',
    lowStockQuantity: 0.3,
    boughtFrom: 'Suki Mart',
    freshnessStatus: 'use-soon',
  },
  {
    id: 'mock-pork-belly',
    ingredientId: 'ingredient-pork',
    displayName: 'Pork Belly',
    category: 'Meat',
    icon: '🥓',
    description: 'Pork belly slices',
    quantity: 0.5,
    unit: 'kg/s',
    unitPricePhp: 700,
    purchaseDate: '2026-06-23',
    expiryDate: '2026-12-25',
    lowStockQuantity: 0.5,
    boughtFrom: 'SM Supermarket',
    freshnessStatus: 'fresh',
  },
  {
    id: 'mock-chicken',
    ingredientId: 'ingredient-chicken',
    displayName: 'Chicken Drumstick',
    category: 'Meat',
    icon: '🍗',
    description: 'Chicken drumsticks',
    quantity: 1,
    unit: 'kg/s',
    unitPricePhp: 220,
    purchaseDate: '2026-06-22',
    expiryDate: '2026-06-29',
    lowStockQuantity: 0.5,
    boughtFrom: 'FreshMart',
    freshnessStatus: 'use-soon',
  },
  {
    id: 'mock-milk',
    ingredientId: 'ingredient-milk',
    displayName: 'Dairy Milk',
    category: 'Dairy & Eggs',
    icon: '🥛',
    description: 'Fresh dairy milk',
    quantity: 1,
    unit: 'L',
    unitPricePhp: 95,
    purchaseDate: '2026-06-21',
    expiryDate: '2026-07-01',
    lowStockQuantity: 1,
    boughtFrom: 'Neighborhood Supermarket',
    freshnessStatus: 'fresh',
  },
  {
    id: 'mock-eggs',
    ingredientId: 'ingredient-eggs',
    displayName: 'Eggs',
    category: 'Dairy & Eggs',
    icon: '🥚',
    description: 'Large eggs',
    quantity: 12,
    unit: 'pcs',
    unitPricePhp: 135,
    purchaseDate: '2026-06-20',
    expiryDate: '2026-07-05',
    lowStockQuantity: 6,
    boughtFrom: 'Neighborhood Supermarket',
    freshnessStatus: 'fresh',
  },
  {
    id: 'mock-brownies',
    ingredientId: 'ingredient-brownies',
    displayName: 'Brownies',
    category: 'Sweets',
    icon: '🍫',
    description: 'Chocolate brownies',
    quantity: 4,
    unit: 'pcs',
    unitPricePhp: 160,
    purchaseDate: '2026-06-20',
    expiryDate: '2026-06-25',
    lowStockQuantity: 2,
    boughtFrom: 'Bakeshop',
    freshnessStatus: 'expiring-today',
  },
  {
    id: 'mock-mango-juice',
    ingredientId: 'ingredient-mango-juice',
    displayName: 'Mango Juice Pack',
    category: 'Beverage',
    icon: '🧃',
    description: 'Mango drink pack',
    quantity: 1,
    unit: 'pack',
    unitPricePhp: 55,
    purchaseDate: '2026-06-18',
    expiryDate: '2026-08-20',
    lowStockQuantity: 2,
    boughtFrom: 'Suki Mart',
    freshnessStatus: 'fresh',
  },
  {
    id: 'mock-samyang',
    ingredientId: 'ingredient-instant-noodles',
    displayName: 'Samyang Premium',
    category: 'Instant Food',
    icon: '🍜',
    description: 'Spicy instant noodles',
    quantity: 3,
    unit: 'packs',
    unitPricePhp: 180,
    purchaseDate: '2026-06-19',
    expiryDate: '2026-11-30',
    lowStockQuantity: 2,
    boughtFrom: 'K-Mart',
    freshnessStatus: 'fresh',
  },
]

export const mockPantryItems: PantryItem[] = mockFoodItems.map((item, index) => ({
  id: item.id,
  ingredientId: item.ingredientId,
  displayName: item.displayName,
  description: item.description,
  quantity: item.quantity,
  unit: item.unit,
  source: 'manual',
  purchaseDate: item.purchaseDate,
  storageLocation:
    item.category === 'Meat'
      ? 'freezer'
      : ['Fruits', 'Dairy & Eggs'].includes(item.category)
        ? 'refrigerator'
        : 'pantry',
  estimatedUseByDate: item.expiryDate,
  freshnessStatus: item.freshnessStatus,
  addedAt: `2026-06-${String(23 - Math.min(index, 8)).padStart(2, '0')}T08:00:00.000Z`,
  createdAt,
  updatedAt: createdAt,
}))

export const mockDashboardStats = {
  tracker: {
    used: 60,
    donated: 10,
    wasted: 30,
    usedCount: 15,
    donatedCount: 2,
    wastedCount: 3,
  },
  actions: {
    used: 60,
    donated: 15,
    wasted: 25,
  },
  badges: ['Food Saver Pro', 'Recipe Pioneer'],
}

export const mockComparisonProfiles: MockComparisonProfile[] = [
  {
    id: 'subscriber-diane',
    displayName: 'Diane',
    avatarColor: '#005bd7',
    friends: 4,
    inventoryCount: 87,
    badge: 'Food Saver Pro',
    badgeIcon: '🏅',
    recipeCount: 14,
    savedCount: 17,
    donatedCount: 2,
    wastedCount: 3,
    savedValuePhp: 860,
    wasteAvoidedKg: 4.8,
    noWasteStreakDays: 6,
  },
  {
    id: 'subscriber-jasmine',
    displayName: 'Jasmine',
    avatarColor: '#9bb8e8',
    friends: 1,
    inventoryCount: 67,
    badge: 'Recipe Pioneer',
    badgeIcon: '🎖️',
    recipeCount: 11,
    savedCount: 22,
    donatedCount: 4,
    wastedCount: 1,
    savedValuePhp: 1120,
    wasteAvoidedKg: 6.1,
    noWasteStreakDays: 9,
  },
]

export const mockPlanFeatures: MockPlanFeature[] = [
  { label: 'manual inventory input', basic: true, unbasic: true },
  { label: 'expiration tracking & reminders', basic: true, unbasic: true },
  { label: 'grocery checklist', basic: true, unbasic: true },
  { label: 'unlimited scanning', basic: false, unbasic: true },
  { label: 'unlimited recipes', basic: false, unbasic: true },
  { label: 'grocery planning', basic: true, unbasic: true },
  { label: 'budget tracker', basic: false, unbasic: true },
  { label: 'inventory history and reports', basic: false, unbasic: true },
  { label: 'AD free experience', basic: false, unbasic: true },
]

export const mockPlans: MockPlan[] = [
  { id: 'unbasic-yearly', name: 'UNBASIC', price: '₱499', cadence: 'yearly', cta: 'subscribe now' },
  {
    id: 'unbasic-half-year',
    name: 'UNBASIC',
    price: '₱249',
    cadence: 'half year',
    cta: 'subscribe now',
  },
  {
    id: 'unbasic-monthly',
    name: 'UNBASIC',
    price: '₱49',
    cadence: 'monthly',
    cta: 'subscribe now',
    featured: true,
  },
  { id: 'unbasic-weekly', name: 'UNBASIC', price: '₱15', cadence: 'weekly', cta: 'subscribe now' },
  {
    id: 'basic-free',
    name: 'BASIC',
    price: '₱0',
    cadence: 'limited features',
    cta: 'subscribe now',
  },
]

export const mockLanguages: MockLanguageOption[] = [
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'tl-PH', label: 'Tagalog', flag: '🇵🇭' },
  { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
  { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { code: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
  { code: 'ru-RU', label: 'Русский', flag: '🇷🇺' },
  { code: 'ko-KR', label: '한국어', flag: '🇰🇷' },
]

export const mockCurrencies: MockCurrencyOption[] = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇸', symbol: '€' },
  { code: 'GBP', name: 'British Pound Sterling', flag: '🇬🇧', symbol: '£' },
  { code: 'COP', name: 'Colombian Peso', flag: '🇨🇴', symbol: '$' },
  { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭', symbol: '₱' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', symbol: '¥' },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷', symbol: 'R$' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', symbol: 'C$' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', symbol: '¥' },
  { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺', symbol: '₽' },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷', symbol: '₩' },
]

export const mockSupportTopics: MockSupportTopic[] = [
  { value: 'bug', title: 'Report bugs' },
  { value: 'feature', title: 'Request a feature' },
  { value: 'support', title: 'Help or Contact Support' },
]

export const mockNotifications: AppNotification[] = [
  {
    id: 'needs-restock',
    title: 'THIS NEEDS A RESTOCK!',
    description: 'Come and take a look at what it is.',
    createdAt: '2026-06-23T07:59:00.000Z',
    type: 'pantry',
    read: false,
  },
  {
    id: 'favorite-meal',
    title: 'Your favorite meal is available to cook again!',
    description: 'Check out the recipe book.',
    createdAt: '2026-06-23T06:00:00.000Z',
    type: 'recipe',
    read: false,
  },
  {
    id: 'comparison-update',
    title: 'Jasmine shared 2 more recipes this week!',
    description: 'Discover new recipes from the comparison panel.',
    createdAt: '2026-06-22T09:00:00.000Z',
    type: 'comparison',
    read: true,
  },
  {
    id: 'meat-low-supply',
    title: 'Your go-to meat is low on supply.',
    description: 'Restock now before your scheduled meals.',
    createdAt: '2026-06-19T12:00:00.000Z',
    type: 'pantry',
    read: true,
  },
  {
    id: 'smart-saver-tip',
    title: 'Smart Saver Tip',
    description: 'You have three ingredients that can combine for a quick budget dinner tonight.',
    createdAt: '2026-06-16T12:00:00.000Z',
    type: 'system',
    read: true,
  },
  {
    id: 'welcome-notifications',
    title: 'Welcome to INVENTORIÉ Diane!',
    description: 'Come check out the notification feature.',
    createdAt: '2026-06-09T12:00:00.000Z',
    type: 'system',
    read: true,
  },
]
