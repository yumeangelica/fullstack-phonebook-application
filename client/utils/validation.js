// Shared validation functions for person data
// These mirror the backend Mongoose validators in server/models/personModel.js

import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

const NAME_REGEX = /^[\p{L}\s'-]+$/u;

const validateName = (name, fieldLabel) => {
  const trimmedName = name.trim();
  if (!trimmedName) return { isValid: false, message: `${fieldLabel} is required` };
  if (trimmedName.length < 3) return { isValid: false, message: `${fieldLabel} must be at least 3 characters` };
  if (trimmedName.length > 50) return { isValid: false, message: `${fieldLabel} cannot exceed 50 characters` };

  if (!NAME_REGEX.test(trimmedName)) {
    return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  if (/\s{2,}/.test(trimmedName)) {
    return { isValid: false, message: 'No multiple spaces allowed' };
  }

  if (/[-']{2,}/.test(trimmedName)) {
    return { isValid: false, message: 'No consecutive hyphens or apostrophes allowed' };
  }

  if (/-'|'-/.test(trimmedName)) {
    return { isValid: false, message: 'Hyphen and apostrophe cannot be adjacent' };
  }

  if (/^[-']|[-']$/.test(trimmedName)) {
    return { isValid: false, message: 'Name cannot start or end with hyphen or apostrophe' };
  }

  return { isValid: true, message: '' };
};

export const validateFirstName = (name) => validateName(name, 'First name');
export const validateLastName = (name) => validateName(name, 'Last name');

// Country codes data
export const countryCodes = [
  { code: '+358', country: 'Finland', countryCode: 'FI', format: 'XX XXX XXXX', example: '40 123 4567' },
  { code: '+46', country: 'Sweden', countryCode: 'SE', format: 'XX XXX XX XX', example: '70 123 45 67' },
  { code: '+47', country: 'Norway', countryCode: 'NO', format: 'XXX XX XXX', example: '900 12 345' },
  { code: '+45', country: 'Denmark', countryCode: 'DK', format: 'XX XX XX XX', example: '20 12 34 56' },
  { code: '+49', country: 'Germany', countryCode: 'DE', format: 'XXX XXXXXXXX', example: '151 12345678' },
  { code: '+33', country: 'France', countryCode: 'FR', format: 'X XX XX XX XX', example: '6 12 34 56 78' },
  { code: '+44', country: 'United Kingdom', countryCode: 'GB', format: 'XXXX XXX XXX', example: '7700 900123' },
  { code: '+1', country: 'United States', countryCode: 'US', format: '(XXX) XXX-XXXX', example: '(555) 123-4567' },
  { code: '+81', country: 'Japan', countryCode: 'JP', format: 'XX XXXX XXXX', example: '90 1234 5678' },
  { code: '+86', country: 'China', countryCode: 'CN', format: 'XXX XXXX XXXX', example: '139 0013 8000' },
];

const VALID_PHONE_TYPES = ['MOBILE', 'FIXED_LINE_OR_MOBILE', 'FIXED_LINE'];

export const validatePhoneNumber = (number, countryCode) => {
  if (!number.trim()) return { isValid: false, message: 'Phone number is required' };

  const country = countryCodes.find(c => c.code === countryCode) || countryCodes[0];
  let trimmedNumber = number.trim();

  // Strip leading 0 for Finnish mobile numbers (common local format)
  if (countryCode === '+358' && /^0[4-5]/.test(trimmedNumber)) {
    trimmedNumber = trimmedNumber.substring(1);
  }

  try {
    const fullNumber = `${countryCode} ${trimmedNumber}`;

    if (!isValidPhoneNumber(fullNumber)) {
      return { isValid: false, message: `Invalid phone number format for ${country.country}. Example: ${country.example}` };
    }

    const phoneNumber = parsePhoneNumber(fullNumber);

    if (!phoneNumber.isValid() || phoneNumber.country !== country.countryCode) {
      return { isValid: false, message: `Invalid phone number for ${country.country}. Example: ${country.example}` };
    }

    const type = phoneNumber.getType();
    if (type && !VALID_PHONE_TYPES.includes(type)) {
      return { isValid: false, message: `Please enter a valid mobile or landline number. Example: ${country.example}` };
    }

    return { isValid: true, message: '' };
  } catch (_error) {
    return { isValid: false, message: `Invalid phone number format. Example: ${country.example}` };
  }
};
