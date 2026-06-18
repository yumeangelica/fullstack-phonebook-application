import assert from 'node:assert';
import { describe, it } from 'node:test';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import AuthForm from './AuthForm';

const setInputValue = (input, value) => {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value',
  ).set;
  nativeInputValueSetter.call(input, value);
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
};

const renderForm = async (overrides = {}) => {
  const notifications = [];
  const logins = [];
  const registrations = [];

  const props = {
    onLogin: async (...args) => logins.push(args),
    onRegister: async (...args) => registrations.push(args),
    showNotification: (message, isError) =>
      notifications.push({ message, isError }),
    ...overrides,
  };

  const container = document.createElement('div');
  document.body.appendChild(container);
  let root;

  await act(async () => {
    root = createRoot(container);
    root.render(<AuthForm {...props} />);
  });

  const cleanup = async () => {
    await act(() => root.unmount());
    document.body.removeChild(container);
  };

  return { container, notifications, logins, registrations, cleanup };
};

describe('<AuthForm />', () => {
  it('renders login mode by default', async () => {
    const { container, cleanup } = await renderForm();

    assert.ok(container.textContent.includes('Sign in to your account'));
    assert.ok(container.querySelector('#username'));
    assert.ok(container.querySelector('#password'));
    // Confirm password only exists in register mode
    assert.strictEqual(container.querySelector('#confirmPassword'), null);

    await cleanup();
  });

  it('switches to register mode', async () => {
    const { container, cleanup } = await renderForm();

    const toggle = container.querySelector('.auth-toggle-btn');
    await act(async () => {
      toggle.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    });

    assert.ok(container.textContent.includes('Create a new account'));
    assert.ok(container.querySelector('#confirmPassword'));

    await cleanup();
  });

  it('submits login credentials', async () => {
    const { container, logins, cleanup } = await renderForm();

    await act(async () => {
      setInputValue(container.querySelector('#username'), 'anna');
      setInputValue(container.querySelector('#password'), 'password123');
    });

    const form = container.querySelector('form');
    await act(async () => {
      form.dispatchEvent(new window.Event('submit', { bubbles: true }));
    });
    // Flush the async submit handler's trailing state updates
    await act(async () => {});

    assert.deepStrictEqual(logins, [['anna', 'password123']]);

    await cleanup();
  });

  it('warns when registering with mismatched passwords', async () => {
    const { container, notifications, registrations, cleanup } =
      await renderForm();

    const toggle = container.querySelector('.auth-toggle-btn');
    await act(async () => {
      toggle.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    });

    await act(async () => {
      setInputValue(container.querySelector('#username'), 'anna');
      setInputValue(container.querySelector('#password'), 'password123');
      setInputValue(
        container.querySelector('#confirmPassword'),
        'different123',
      );
    });

    const form = container.querySelector('form');
    await act(async () => {
      form.dispatchEvent(new window.Event('submit', { bubbles: true }));
    });

    assert.strictEqual(registrations.length, 0);
    assert.ok(
      notifications.some(
        (n) => n.isError && n.message === 'Passwords do not match',
      ),
    );

    await cleanup();
  });
});
