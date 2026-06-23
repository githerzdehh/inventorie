import { getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js'
import type { AllowedPhoneCountry } from '@/composables/app-types'

export interface PhoneValidationResult {
  phoneNumber: string | null
  errorMessage: string | null
}

export function getPhoneCountryLabel(country: AllowedPhoneCountry): string {
  return country === 'PH' ? `Philippines (+${getCountryCallingCode(country)})` : country
}

export function validateAndNormalizePhoneNumber(
  value: unknown,
  country: AllowedPhoneCountry = 'PH',
): PhoneValidationResult {
  const rawValue = typeof value === 'string' ? value.trim() : ''

  if (!rawValue) {
    return {
      phoneNumber: null,
      errorMessage: null,
    }
  }

  const parsedNumber = parsePhoneNumberFromString(rawValue, country)

  if (!parsedNumber || !parsedNumber.isValid()) {
    return {
      phoneNumber: null,
      errorMessage: `Enter a valid ${getPhoneCountryLabel(country)} phone number.`,
    }
  }

  if (parsedNumber.country !== country) {
    return {
      phoneNumber: null,
      errorMessage: `Only ${getPhoneCountryLabel(country)} phone numbers are allowed.`,
    }
  }

  return {
    phoneNumber: parsedNumber.number,
    errorMessage: null,
  }
}

export function getPhoneValidationMessage(
  value: unknown,
  country: AllowedPhoneCountry = 'PH',
): string | null {
  return validateAndNormalizePhoneNumber(value, country).errorMessage
}
