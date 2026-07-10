import assert from 'node:assert';
import { afterEach, describe, it } from 'node:test';
import { act, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfirmProvider } from './useConfirm';
import usePersons from './usePersons';

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

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const initialPersons = [
  { id: '1', firstName: 'Anna', lastName: 'Smith', number: '+358 40 1234567' },
  { id: '2', firstName: 'Bob', lastName: 'Jones', number: '+358 50 7654321' },
];

const PersonsProbe = ({ user, notifications, apiRef }) => {
  const showNotification = useCallback(
    (message, isError) => {
      notifications.push({ message, isError });
    },
    [notifications],
  );
  const personsApi = usePersons(showNotification, user);
  apiRef.current = personsApi;

  return (
    <ul>
      {personsApi.persons.map((person) => (
        <li key={person.id}>
          {person.firstName} {person.lastName}
        </li>
      ))}
    </ul>
  );
};

const renderProbe = async (user, notifications = []) => {
  const apiRef = { current: null };
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root;

  await act(async () => {
    root = createRoot(container);
    root.render(
      <ConfirmProvider>
        <PersonsProbe
          user={user}
          notifications={notifications}
          apiRef={apiRef}
        />
      </ConfirmProvider>,
    );
  });

  const cleanup = async () => {
    await act(() => root.unmount());
    document.body.removeChild(container);
  };

  return { container, apiRef, cleanup };
};

const clickButton = async (button) => {
  await act(async () => {
    button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  });
};

afterEach(() => {
  global.fetch = originalFetch;
});

describe('usePersons', () => {
  it('fetches persons when a user is set', async () => {
    const calls = [];
    global.fetch = async (url, options = {}) => {
      calls.push({ url, method: options.method || 'GET' });
      return jsonResponse({ persons: initialPersons, pagination: {} });
    };

    const { container, cleanup } = await renderProbe({ username: 'tester' });

    await waitFor(() => {
      assert.strictEqual(container.querySelectorAll('li').length, 2);
    });

    assert.deepStrictEqual(calls, [{ url: '/api/persons', method: 'GET' }]);
    assert.ok(container.textContent.includes('Anna Smith'));

    await cleanup();
  });

  it('clears persons without fetching when there is no user', async () => {
    global.fetch = async () => {
      throw new Error('fetch should not be called');
    };

    const { container, apiRef, cleanup } = await renderProbe(null);

    await waitFor(() => {
      assert.strictEqual(apiRef.current.loading, false);
    });

    assert.strictEqual(container.querySelectorAll('li').length, 0);

    await cleanup();
  });

  it('detects duplicates case-insensitively and cancelling keeps the person unchanged', async () => {
    const calls = [];
    global.fetch = async (url, options = {}) => {
      calls.push({ url, method: options.method || 'GET' });
      return jsonResponse({ persons: initialPersons, pagination: {} });
    };

    const { apiRef, cleanup } = await renderProbe({ username: 'tester' });

    await waitFor(() => {
      assert.strictEqual(apiRef.current.persons.length, 2);
    });

    let addResult;
    await act(async () => {
      addResult = apiRef.current.addPerson({
        firstName: 'anna',
        lastName: 'SMITH',
        number: '+358 40 9999999',
      });
    });

    // The replace confirmation dialog should be open
    const cancelButton = document.querySelector('.confirm-dialog-cancel');
    assert.ok(cancelButton);

    await clickButton(cancelButton);

    assert.strictEqual(await addResult, false);
    // Only the initial GET, no update request
    assert.deepStrictEqual(calls, [{ url: '/api/persons', method: 'GET' }]);

    await cleanup();
  });

  it('removes a person after confirmation', async () => {
    const calls = [];
    global.fetch = async (url, options = {}) => {
      const method = options.method || 'GET';
      calls.push({ url, method });

      if (method === 'DELETE') {
        return new Response(null, { status: 204 });
      }
      return jsonResponse({ persons: initialPersons, pagination: {} });
    };

    const notifications = [];
    const { container, apiRef, cleanup } = await renderProbe(
      { username: 'tester' },
      notifications,
    );

    await waitFor(() => {
      assert.strictEqual(apiRef.current.persons.length, 2);
    });

    let removeResult;
    await act(async () => {
      removeResult = apiRef.current.removePerson('1');
    });

    const confirmButton = document.querySelector('.confirm-dialog-confirm');
    assert.ok(confirmButton);

    await clickButton(confirmButton);
    await removeResult;

    await waitFor(() => {
      assert.strictEqual(container.querySelectorAll('li').length, 1);
    });

    assert.ok(
      calls.some(
        (call) => call.url === '/api/persons/1' && call.method === 'DELETE',
      ),
    );
    assert.strictEqual(notifications.at(-1).message, 'Deleted Anna Smith');

    await cleanup();
  });
});
