import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

const NewPersonForm = ({ newFirstName, newLastName, newNumber, newCountryCode, addName, handleFirstNameChange, handleLastNameChange, handleNumberChange, handleCountryCodeChange }) => {

  // Clear form function with confirmation
  const clearForm = () => {
    const hasContent = newFirstName || newLastName || newNumber;

    if (hasContent) {
      const confirmClear = window.confirm('Are you sure you want to clear all fields?');
      if (!confirmClear) return;
    }

    // Clear all fields
    handleFirstNameChange({ target: { value: '' } });
    handleLastNameChange({ target: { value: '' } });
    handleNumberChange({ target: { value: '' } });
    handleCountryCodeChange({ target: { value: '+358' } });
  };

  // Common country codes with their formats and proper validation
  const countryCodes = [
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

  // Get current country info
  const currentCountry = countryCodes.find(c => c.code === newCountryCode) || countryCodes[0];

  // Validation functions matching backend rules
  const validateFirstName = (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return { isValid: false, message: 'First name is required' };
    if (trimmedName.length < 3) return { isValid: false, message: 'First name must be at least 3 characters' };
    if (trimmedName.length > 50) return { isValid: false, message: 'First name cannot exceed 50 characters' };

    // Unicode regex supports international characters (accents, non-Latin scripts)
    const nameRegex = /^[\p{L}\s'-]+$/u;
    if (!nameRegex.test(trimmedName)) {
      return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }

    // Prevent multiple consecutive spaces for better data quality
    if (/\s{2,}/.test(trimmedName)) {
      return { isValid: false, message: 'No multiple spaces allowed' };
    }

    // Prevent consecutive special characters that could cause display issues
    if (/[-']{2,}/.test(trimmedName)) {
      return { isValid: false, message: 'No consecutive hyphens or apostrophes allowed' };
    }

    // Prevent adjacent special characters that are linguistically invalid
    if (/-'|'-/.test(trimmedName)) {
      return { isValid: false, message: 'Hyphen and apostrophe cannot be adjacent' };
    }

    // Names should not start or end with special characters
    if (/^[-']|[-']$/.test(trimmedName)) {
      return { isValid: false, message: 'Name cannot start or end with hyphen or apostrophe' };
    }

    return { isValid: true, message: '' };
  };

  const validateLastName = (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return { isValid: false, message: 'Last name is required' };
    if (trimmedName.length < 3) return { isValid: false, message: 'Last name must be at least 3 characters' };
    if (trimmedName.length > 50) return { isValid: false, message: 'Last name cannot exceed 50 characters' };

    // Unicode regex for proper international name support
    const nameRegex = /^[\p{L}\s'-]+$/u;
    if (!nameRegex.test(trimmedName)) {
      return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }

    // Check for multiple consecutive spaces
    if (/\s{2,}/.test(trimmedName)) {
      return { isValid: false, message: 'No multiple spaces allowed' };
    }

    // Check for invalid character combinations
    if (/[-']{2,}/.test(trimmedName)) {
      return { isValid: false, message: 'No consecutive hyphens or apostrophes allowed' };
    }

    // Check for hyphen followed by apostrophe or vice versa
    if (/-'|'-/.test(trimmedName)) {
      return { isValid: false, message: 'Hyphen and apostrophe cannot be adjacent' };
    }

    // Name cannot start or end with hyphen or apostrophe
    if (/^[-']|[-']$/.test(trimmedName)) {
      return { isValid: false, message: 'Name cannot start or end with hyphen or apostrophe' };
    }

    return { isValid: true, message: '' };
  };

  const validateNumber = (number, countryCode) => {
    if (!number.trim()) return { isValid: false, message: 'Phone number is required' };

    const country = countryCodes.find(c => c.code === countryCode) || countryCodes[0];
    let trimmedNumber = number.trim();

    // Remove leading zero from Finnish mobile numbers to comply with international format
    if (countryCode === '+358') {
      // Finnish mobile numbers (04x, 05x) should not include leading zero after country code
      if (/^0[4-5]/.test(trimmedNumber)) {
        trimmedNumber = trimmedNumber.substring(1); // Remove the leading zero
      }
    }

    try {
      // Construct full international number for validation
      const fullNumber = countryCode + ' ' + trimmedNumber;

      // Validate using libphonenumber-js for real-world phone number validation
      if (!isValidPhoneNumber(fullNumber)) {
        return { isValid: false, message: `Invalid phone number format for ${country.country}. Example: ${country.example}` };
      }

      // Parse number to access detailed validation and type information
      const phoneNumber = parsePhoneNumber(fullNumber);

      // Ensure number is valid and belongs to the selected country
      if (!phoneNumber.isValid() || phoneNumber.country !== country.countryCode) {
        return { isValid: false, message: `Invalid phone number for ${country.country}. Example: ${country.example}` };
      }

      // Restrict to mobile and landline numbers only
      if (phoneNumber.getType() && !['MOBILE', 'FIXED_LINE_OR_MOBILE', 'FIXED_LINE'].includes(phoneNumber.getType())) {
        return { isValid: false, message: `Please enter a valid mobile or landline number. Example: ${country.example}` };
      }

      return { isValid: true, message: '' };

    } catch (error) {
      // Handle parsing errors with helpful example
      return { isValid: false, message: `Invalid phone number format. Example: ${country.example}` };
    }
  };

  // Get validation results
  const firstNameValidation = validateFirstName(newFirstName);
  const lastNameValidation = validateLastName(newLastName);
  const numberValidation = validateNumber(newNumber, newCountryCode);

  // Check if form is valid for submit button
  const isFormValid = firstNameValidation.isValid && lastNameValidation.isValid && numberValidation.isValid;

  // Only show validation feedback if user has started typing
  const showFirstNameFeedback = newFirstName.length > 0;
  const showLastNameFeedback = newLastName.length > 0;
  const showNumberFeedback = newNumber.length > 0;

  return (
    <div className="form-container">
      <div className="form-content">
        <h2 className="form-title">Add a new contact</h2>
        <Form onSubmit={(e) => {
          e.preventDefault();
          // Double-check validation before submitting
          if (isFormValid) {
            addName(e);
          }
        }} className="new-person-form">
          <Form.Group>

            <Form.Label className="form-label">
              First Name:
              {showFirstNameFeedback && (
                <span className={`validation-icon ${firstNameValidation.isValid ? 'valid' : 'invalid'}`}>
                  {firstNameValidation.isValid ? ' ✓' : ' ✗'}
                </span>
              )}
            </Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={newFirstName}
              onChange={handleFirstNameChange}
              className={`form-input ${showFirstNameFeedback ? (firstNameValidation.isValid ? 'is-valid' : 'is-invalid') : ''}`}
            />
            {showFirstNameFeedback && !firstNameValidation.isValid && (
              <div className="validation-message error">{firstNameValidation.message}</div>
            )}

            <Form.Label className="form-label">
              Last Name:
              {showLastNameFeedback && (
                <span className={`validation-icon ${lastNameValidation.isValid ? 'valid' : 'invalid'}`}>
                  {lastNameValidation.isValid ? ' ✓' : ' ✗'}
                </span>
              )}
            </Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={newLastName}
              onChange={handleLastNameChange}
              className={`form-input ${showLastNameFeedback ? (lastNameValidation.isValid ? 'is-valid' : 'is-invalid') : ''}`}
            />
            {showLastNameFeedback && !lastNameValidation.isValid && (
              <div className="validation-message error">{lastNameValidation.message}</div>
            )}

            <Form.Label className="form-label">Country & Number:</Form.Label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <Form.Select
                value={newCountryCode}
                onChange={handleCountryCodeChange}
                className="form-input"
                style={{ flex: '0 0 140px' }}
              >
                {countryCodes.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.code} {country.country}
                  </option>
                ))}
              </Form.Select>

              <div style={{ flex: 1 }}>
                <Form.Control
                  type="text"
                  name="number"
                  value={newNumber}
                  onChange={handleNumberChange}
                  className={`form-input ${showNumberFeedback ? (numberValidation.isValid ? 'is-valid' : 'is-invalid') : ''}`}
                  placeholder={`Example: ${currentCountry.example}`}
                  style={{ marginBottom: 0 }}
                />
                {showNumberFeedback && (
                  <span className={`validation-icon ${numberValidation.isValid ? 'valid' : 'invalid'}`} style={{ marginLeft: '8px' }}>
                    {numberValidation.isValid ? '✓' : '✗'}
                  </span>
                )}
              </div>
            </div>
            {showNumberFeedback && !numberValidation.isValid && (
              <div className="validation-message error">{numberValidation.message}</div>
            )}

            <div className="form-buttons">
              <Button
                variant="primary"
                type="submit"
                className={`submit-btn ${!isFormValid ? 'disabled' : ''}`}
                disabled={!isFormValid}
              >
                Add
              </Button>

              <Button
                variant="outline-secondary"
                type="button"
                className="clear-btn"
                onClick={clearForm}
              >
                Clear
              </Button>
            </div>

          </Form.Group>
        </Form>
      </div>
    </div>
  );
};

export default NewPersonForm;
