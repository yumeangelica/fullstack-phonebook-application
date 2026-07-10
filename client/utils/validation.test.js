import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  stripFinnishLeadingZero,
  validateFirstName,
  validateLastName,
  validatePhoneNumber,
} from './validation';

describe('validateFirstName / validateLastName', () => {
  it('accepts a regular name', () => {
    const result = validateFirstName('John');
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.message, '');
  });

  it('accepts two-character names', () => {
    assert.strictEqual(validateFirstName('Bo').isValid, true);
    assert.strictEqual(validateLastName('Li').isValid, true);
  });

  it('accepts unicode letters', () => {
    assert.strictEqual(validateFirstName('Äiti').isValid, true);
    assert.strictEqual(validateFirstName('山田').isValid, true);
  });

  it('accepts hyphens and apostrophes inside the name', () => {
    assert.strictEqual(validateFirstName('Anna-Liisa').isValid, true);
    assert.strictEqual(validateLastName("O'Brien").isValid, true);
  });

  it('rejects an empty name', () => {
    const result = validateFirstName('   ');
    assert.strictEqual(result.isValid, false);
    assert.ok(result.message.includes('required'));
  });

  it('rejects a one-character name', () => {
    const result = validateFirstName('J');
    assert.strictEqual(result.isValid, false);
    assert.ok(result.message.includes('at least 2 characters'));
  });

  it('rejects names over 50 characters', () => {
    const result = validateLastName('a'.repeat(51));
    assert.strictEqual(result.isValid, false);
    assert.ok(result.message.includes('50'));
  });

  it('rejects digits and other invalid characters', () => {
    assert.strictEqual(validateFirstName('John123').isValid, false);
    assert.strictEqual(validateFirstName('John_Doe').isValid, false);
  });

  it('rejects multiple consecutive spaces', () => {
    const result = validateFirstName('Anna  Maria');
    assert.strictEqual(result.isValid, false);
    assert.ok(result.message.includes('multiple spaces'));
  });

  it('rejects consecutive hyphens or apostrophes', () => {
    assert.strictEqual(validateFirstName('Anna--Liisa').isValid, false);
    assert.strictEqual(validateLastName("O''Brien").isValid, false);
  });

  it('rejects names starting or ending with hyphen or apostrophe', () => {
    assert.strictEqual(validateFirstName('-Anna').isValid, false);
    assert.strictEqual(validateFirstName("Anna'").isValid, false);
  });

  it('uses the field label in the message', () => {
    assert.ok(validateFirstName('').message.startsWith('First name'));
    assert.ok(validateLastName('').message.startsWith('Last name'));
  });
});

describe('stripFinnishLeadingZero', () => {
  it('strips the leading zero from finnish mobile numbers', () => {
    assert.strictEqual(
      stripFinnishLeadingZero('040 1234567', '+358'),
      '40 1234567',
    );
    assert.strictEqual(
      stripFinnishLeadingZero('050 1234567', '+358'),
      '50 1234567',
    );
  });

  it('leaves numbers without a leading zero unchanged', () => {
    assert.strictEqual(
      stripFinnishLeadingZero('40 1234567', '+358'),
      '40 1234567',
    );
  });

  it('leaves non-mobile prefixes unchanged', () => {
    assert.strictEqual(
      stripFinnishLeadingZero('09 123456', '+358'),
      '09 123456',
    );
  });

  it('does not touch other country codes', () => {
    assert.strictEqual(
      stripFinnishLeadingZero('070 123 45 67', '+46'),
      '070 123 45 67',
    );
  });
});

describe('validatePhoneNumber', () => {
  it('accepts a valid finnish mobile number', () => {
    const result = validatePhoneNumber('40 1234567', '+358');
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.message, '');
  });

  it('accepts a finnish mobile number entered with a leading zero', () => {
    assert.strictEqual(
      validatePhoneNumber('040 1234567', '+358').isValid,
      true,
    );
  });

  it('rejects an empty number', () => {
    const result = validatePhoneNumber('   ', '+358');
    assert.strictEqual(result.isValid, false);
    assert.ok(result.message.includes('required'));
  });

  it('rejects a number that is too short', () => {
    const result = validatePhoneNumber('123', '+358');
    assert.strictEqual(result.isValid, false);
    assert.ok(result.message.includes('Example'));
  });

  it('rejects a number that is too long', () => {
    const result = validatePhoneNumber('40 12345678999', '+358');
    assert.strictEqual(result.isValid, false);
    assert.ok(result.message.includes('Example'));
  });

  it('accepts a valid number for another country', () => {
    assert.strictEqual(
      validatePhoneNumber('70 123 45 67', '+46').isValid,
      true,
    );
  });
});
