import assert from 'node:assert';
import { describe, it } from 'node:test';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Filter from './Filter';

describe('<Filter />', () => {
  it('renders the input with the current value', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    let root;

    await act(async () => {
      root = createRoot(container);
      root.render(<Filter newFilter="anna" onFilterChange={() => {}} />);
    });

    const input = container.querySelector('#filterInput');
    assert.ok(input);
    assert.strictEqual(input.value, 'anna');
    assert.ok(container.textContent.includes('Showing results for "anna"'));

    await act(() => root.unmount());
    document.body.removeChild(container);
  });

  it('calls onFilterChange when typing', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    let root;
    const calls = [];

    await act(async () => {
      root = createRoot(container);
      root.render(
        <Filter newFilter="" onFilterChange={(value) => calls.push(value)} />,
      );
    });

    const input = container.querySelector('#filterInput');
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    ).set;

    await act(async () => {
      nativeInputValueSetter.call(input, 'bob');
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
    });

    assert.deepStrictEqual(calls, ['bob']);

    await act(() => root.unmount());
    document.body.removeChild(container);
  });

  it('shows a clear button only when a filter is set', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    let root;
    const calls = [];

    await act(async () => {
      root = createRoot(container);
      root.render(
        <Filter newFilter="x" onFilterChange={(value) => calls.push(value)} />,
      );
    });

    const clearButton = container.querySelector(
      'button[aria-label="Clear search filter"]',
    );
    assert.ok(clearButton);

    await act(async () => {
      clearButton.dispatchEvent(
        new window.MouseEvent('click', { bubbles: true }),
      );
    });

    assert.deepStrictEqual(calls, ['']);

    await act(() => root.unmount());
    document.body.removeChild(container);
  });
});
