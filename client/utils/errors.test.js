import assert from 'node:assert';
import { describe, it } from 'node:test';
import { getErrorMessage } from './errors';

describe('getErrorMessage', () => {
  it('prefers the error field from the response body', () => {
    const error = {
      response: { data: { error: 'Username already taken', details: ['x'] } },
      message: 'Request failed',
    };

    assert.strictEqual(getErrorMessage(error), 'Username already taken');
  });

  it('joins validation details when there is no error field', () => {
    const error = {
      response: {
        data: { details: ['First name is required', 'Number is invalid'] },
      },
      message: 'Request failed',
    };

    assert.strictEqual(
      getErrorMessage(error),
      'First name is required, Number is invalid',
    );
  });

  it('falls back to the error message without response data', () => {
    assert.strictEqual(
      getErrorMessage(new Error('Network down')),
      'Network down',
    );
  });

  it('ignores a response without a body', () => {
    const error = { response: {}, message: 'Request timed out' };

    assert.strictEqual(getErrorMessage(error), 'Request timed out');
  });

  it('uses the default fallback when nothing is available', () => {
    assert.strictEqual(getErrorMessage({}), 'An unexpected error occurred');
  });

  it('uses a custom fallback when provided', () => {
    assert.strictEqual(getErrorMessage({}, 'Sign in failed'), 'Sign in failed');
  });
});
