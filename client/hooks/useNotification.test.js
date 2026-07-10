import assert from 'node:assert';
import { describe, it } from 'node:test';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import useNotification from './useNotification';

const NotificationProbe = ({ duration, apiRef }) => {
  const notification = useNotification(duration);
  apiRef.current = notification;

  return <div>{notification.message}</div>;
};

const renderProbe = async (duration) => {
  const apiRef = { current: null };
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root;

  await act(async () => {
    root = createRoot(container);
    root.render(<NotificationProbe duration={duration} apiRef={apiRef} />);
  });

  const cleanup = async () => {
    await act(() => root.unmount());
    document.body.removeChild(container);
  };

  return { container, apiRef, cleanup };
};

const sleep = (ms) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });

describe('useNotification', () => {
  it('shows a message and auto-clears it after the duration', async () => {
    const { container, apiRef, cleanup } = await renderProbe(50);

    await act(async () => {
      apiRef.current.showNotification('Added Anna Smith');
    });

    assert.strictEqual(apiRef.current.message, 'Added Anna Smith');
    assert.strictEqual(apiRef.current.isError, false);
    assert.ok(container.textContent.includes('Added Anna Smith'));

    await sleep(150);

    assert.strictEqual(apiRef.current.message, null);
    assert.strictEqual(apiRef.current.isError, false);

    await cleanup();
  });

  it('flags error notifications', async () => {
    const { apiRef, cleanup } = await renderProbe(50);

    await act(async () => {
      apiRef.current.showNotification('Something failed', true);
    });

    assert.strictEqual(apiRef.current.message, 'Something failed');
    assert.strictEqual(apiRef.current.isError, true);

    await cleanup();
  });

  it('replaces the message and restarts the timer on consecutive notifications', async () => {
    const { apiRef, cleanup } = await renderProbe(500);

    await act(async () => {
      apiRef.current.showNotification('first', true);
    });
    await sleep(300);
    await act(async () => {
      apiRef.current.showNotification('second');
    });

    assert.strictEqual(apiRef.current.message, 'second');
    assert.strictEqual(apiRef.current.isError, false);

    // 600ms after the first call its timer would have fired, but it was
    // cleared by the second call, so the second message is still visible
    await sleep(300);
    assert.strictEqual(apiRef.current.message, 'second');

    // The second message clears after its own full duration
    await sleep(300);
    assert.strictEqual(apiRef.current.message, null);

    await cleanup();
  });

  it('cancels the pending timer on unmount', async () => {
    const originalSetTimeout = global.setTimeout;
    const originalClearTimeout = global.clearTimeout;
    const hookTimerIds = [];
    const clearedIds = [];

    // Track only the hook's timer via its distinctive duration, so timers
    // set by React or the test itself don't cause false positives
    global.setTimeout = (fn, delay, ...args) => {
      const id = originalSetTimeout(fn, delay, ...args);
      if (delay === 60000) {
        hookTimerIds.push(id);
      }
      return id;
    };
    global.clearTimeout = (id) => {
      clearedIds.push(id);
      return originalClearTimeout(id);
    };

    try {
      const { apiRef, cleanup } = await renderProbe(60000);

      await act(async () => {
        apiRef.current.showNotification('pending');
      });

      assert.strictEqual(hookTimerIds.length, 1);

      await cleanup();

      assert.ok(clearedIds.includes(hookTimerIds[0]));
    } finally {
      global.setTimeout = originalSetTimeout;
      global.clearTimeout = originalClearTimeout;
    }
  });
});
