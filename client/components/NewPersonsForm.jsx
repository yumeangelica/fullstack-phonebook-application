import { useState } from 'react';
import useConfirm from '../hooks/useConfirm';
import {
  countryCodes,
  validateFirstName,
  validateLastName,
  validatePhoneNumber,
} from '../utils/validation';

const NewPersonForm = ({
  newFirstName,
  newLastName,
  newNumber,
  newCountryCode,
  addName,
  handleFirstNameChange,
  handleLastNameChange,
  handleNumberChange,
  handleCountryCodeChange,
}) => {
  const confirm = useConfirm();
  const [submitting, setSubmitting] = useState(false);

  // Disable the submit button while the request is in flight
  const handleSubmit = async (event) => {
    setSubmitting(true);
    try {
      await addName(event);
    } finally {
      setSubmitting(false);
    }
  };

  const clearForm = async () => {
    const hasContent = newFirstName || newLastName || newNumber;

    if (hasContent) {
      const confirmClear = await confirm({
        message: 'Are you sure you want to clear all fields?',
        confirmLabel: 'Clear',
      });
      if (!confirmClear) return;
    }

    handleFirstNameChange({ target: { value: '' } });
    handleLastNameChange({ target: { value: '' } });
    handleNumberChange({ target: { value: '' } });
    handleCountryCodeChange({ target: { value: '+358' } });
  };

  const currentCountry =
    countryCodes.find((c) => c.code === newCountryCode) || countryCodes[0];

  const firstNameValidation = validateFirstName(newFirstName);
  const lastNameValidation = validateLastName(newLastName);
  const numberValidation = validatePhoneNumber(newNumber, newCountryCode);

  const isFormValid =
    firstNameValidation.isValid &&
    lastNameValidation.isValid &&
    numberValidation.isValid;

  const showFirstNameFeedback = newFirstName.length > 0;
  const showLastNameFeedback = newLastName.length > 0;
  const showNumberFeedback = newNumber.length > 0;

  return (
    <div className="form-container">
      <div className="form-content">
        <h2 className="form-title">Add a new contact</h2>
        <form onSubmit={handleSubmit} className="new-person-form">
          <div>
            <label htmlFor="firstName" className="form-label">
              First Name:
              {showFirstNameFeedback && (
                <span
                  className={`validation-icon ${firstNameValidation.isValid ? 'valid' : 'invalid'}`}
                  aria-hidden="true"
                >
                  {firstNameValidation.isValid ? ' ✓' : ' ✗'}
                </span>
              )}
            </label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              autoComplete="given-name"
              value={newFirstName}
              onChange={handleFirstNameChange}
              aria-invalid={
                showFirstNameFeedback && !firstNameValidation.isValid
                  ? 'true'
                  : undefined
              }
              aria-describedby={
                showFirstNameFeedback && !firstNameValidation.isValid
                  ? 'firstName-error'
                  : undefined
              }
              className={`form-input ${showFirstNameFeedback ? (firstNameValidation.isValid ? 'is-valid' : 'is-invalid') : ''}`}
            />
            {/* Always rendered so screen readers announce message changes */}
            <div id="firstName-error" aria-live="polite">
              {showFirstNameFeedback && !firstNameValidation.isValid && (
                <div className="validation-message error">
                  {firstNameValidation.message}
                </div>
              )}
            </div>

            <label htmlFor="lastName" className="form-label">
              Last Name:
              {showLastNameFeedback && (
                <span
                  className={`validation-icon ${lastNameValidation.isValid ? 'valid' : 'invalid'}`}
                  aria-hidden="true"
                >
                  {lastNameValidation.isValid ? ' ✓' : ' ✗'}
                </span>
              )}
            </label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              autoComplete="family-name"
              value={newLastName}
              onChange={handleLastNameChange}
              aria-invalid={
                showLastNameFeedback && !lastNameValidation.isValid
                  ? 'true'
                  : undefined
              }
              aria-describedby={
                showLastNameFeedback && !lastNameValidation.isValid
                  ? 'lastName-error'
                  : undefined
              }
              className={`form-input ${showLastNameFeedback ? (lastNameValidation.isValid ? 'is-valid' : 'is-invalid') : ''}`}
            />
            <div id="lastName-error" aria-live="polite">
              {showLastNameFeedback && !lastNameValidation.isValid && (
                <div className="validation-message error">
                  {lastNameValidation.message}
                </div>
              )}
            </div>

            <label htmlFor="phoneNumber" className="form-label">
              Country & Number:
            </label>
            <div className="phone-input-row">
              <select
                id="countryCode"
                value={newCountryCode}
                onChange={handleCountryCodeChange}
                className="form-input country-select"
                aria-label="Country code"
              >
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code} {country.country}
                  </option>
                ))}
              </select>

              <div className="phone-number-wrapper">
                <input
                  id="phoneNumber"
                  type="tel"
                  name="number"
                  autoComplete="tel-national"
                  value={newNumber}
                  onChange={handleNumberChange}
                  aria-invalid={
                    showNumberFeedback && !numberValidation.isValid
                      ? 'true'
                      : undefined
                  }
                  aria-describedby={
                    showNumberFeedback && !numberValidation.isValid
                      ? 'number-error'
                      : undefined
                  }
                  className={`form-input ${showNumberFeedback ? (numberValidation.isValid ? 'is-valid' : 'is-invalid') : ''}`}
                  placeholder={`Example: ${currentCountry.example}`}
                />
                {showNumberFeedback && (
                  <span
                    className={`validation-icon ${numberValidation.isValid ? 'valid' : 'invalid'}`}
                    aria-hidden="true"
                  >
                    {numberValidation.isValid ? '✓' : '✗'}
                  </span>
                )}
              </div>
            </div>
            <div id="number-error" aria-live="polite">
              {showNumberFeedback && !numberValidation.isValid && (
                <div className="validation-message error">
                  {numberValidation.message}
                </div>
              )}
            </div>

            <div className="form-buttons">
              <button
                type="submit"
                className={`submit-btn ${!isFormValid || submitting ? 'disabled' : ''}`}
                disabled={!isFormValid || submitting}
              >
                {submitting ? (
                  <>
                    <span className="loading-spinner" aria-hidden="true" />
                    <span className="sr-only">Loading</span>
                  </>
                ) : (
                  'Add'
                )}
              </button>

              <button
                type="button"
                className="clear-btn"
                onClick={clearForm}
                disabled={submitting}
              >
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPersonForm;
