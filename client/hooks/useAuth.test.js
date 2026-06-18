import assert from 'node:assert';
import { afterEach, describe, it } from 'node:test';
import { act, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import apiService from '../services/api';
import useAuth from './useAuth';

const STORAGE_KEY = 'phonebook-user';
const originalFetch = global.fetch;

const waitFor = async (assertion) => {
  let lastError;

  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      assertion();
      return;
    } catch (error) {
      lastError = error;
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    }
  }

  throw lastError;
};

const AuthProbe = ({ onState }) => {
  const auth = useAuth();
  const { loading, user } = auth;

  useEffect(() => {
    onState({ loading, user });
  }, [loading, user, onState]);

  return <span>{loading ? 'loading' : user?.username || 'signed-out'}</span>;
};

const renderProbe = async (onState = () => {}) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root;

  await act(async () => {
    root = createRoot(container);
    root.render(<AuthProbe onState={onState} />);
  });

  const cleanup = async () => {
    await act(() => root.unmount());
    document.body.removeChild(container);
  };

  return { container, cleanup };
};

afterEach(() => {
  global.fetch = originalFetch;
  window.localStorage.clear();
  apiService.clearToken();
});

describe('useAuth', () => {
  it('refreshes stored sessions from the current user endpoint', async () => {
    const calls = [];

    global.fetch = async (url, options) => {
      calls.push({ url, options });

      return new Response(
        JSON.stringify({ username: 'fresh-user', id: 'fresh-id' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    };

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        username: 'stale-user',
        id: 'stale-id',
        token: 'stored-token',
      }),
    );

    const { container, cleanup } = await renderProbe();

    await waitFor(() => {
      assert.strictEqual(container.textContent, 'fresh-user');
    });

    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].url, '/api/auth/me');
    assert.strictEqual(
      calls[0].options.headers.Authorization,
      'Bearer stored-token',
    );

    const storedUser = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    assert.deepStrictEqual(storedUser, {
      username: 'fresh-user',
      id: 'fresh-id',
      token: 'stored-token',
    });

    await cleanup();
  });

  it('clears malformed stored sessions without calling the API', async () => {
    const states = [];

    global.fetch = async () => {
      throw new Error('fetch should not be called');
    };

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ username: 'stale-user' }),
    );

    const { container, cleanup } = await renderProbe((auth) => {
      states.push({ loading: auth.loading, user: auth.user });
    });

    await waitFor(() => {
      assert.strictEqual(container.textContent, 'signed-out');
    });

    assert.strictEqual(window.localStorage.getItem(STORAGE_KEY), null);
    assert.strictEqual(states.at(-1).user, null);

    await cleanup();
  });
});
