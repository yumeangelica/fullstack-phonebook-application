import assert from 'node:assert';
import { describe, it } from 'node:test';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import ConfirmDialog from './ConfirmDialog';

const renderDialog = async (props) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root;

  await act(async () => {
    root = createRoot(container);
    root.render(<ConfirmDialog message="Delete this contact?" {...props} />);
  });

  const cleanup = async () => {
    await act(() => root.unmount());
    document.body.removeChild(container);
  };

  return { container, cleanup };
};

describe('<ConfirmDialog />', () => {
  it('renders the message and default labels', async () => {
    const { container, cleanup } = await renderDialog({
      onConfirm: () => {},
      onCancel: () => {},
    });

    assert.ok(container.textContent.includes('Delete this contact?'));
    assert.ok(container.textContent.includes('Confirm'));
    assert.ok(container.textContent.includes('Cancel'));

    const dialog = container.querySelector('[role="alertdialog"]');
    assert.ok(dialog);
    assert.strictEqual(dialog.getAttribute('aria-modal'), 'true');

    await cleanup();
  });

  it('calls onConfirm when the confirm button is clicked', async () => {
    let confirmed = false;
    const { container, cleanup } = await renderDialog({
      confirmLabel: 'Delete',
      onConfirm: () => {
        confirmed = true;
      },
      onCancel: () => {},
    });

    const confirmButton = container.querySelector('.confirm-dialog-confirm');
    assert.strictEqual(confirmButton.textContent, 'Delete');

    await act(async () => {
      confirmButton.dispatchEvent(
        new window.MouseEvent('click', { bubbles: true }),
      );
    });

    assert.strictEqual(confirmed, true);
    await cleanup();
  });

  it('calls onCancel when Escape is pressed', async () => {
    let cancelled = false;
    const { cleanup } = await renderDialog({
      onConfirm: () => {},
      onCancel: () => {
        cancelled = true;
      },
    });

    await act(async () => {
      document.dispatchEvent(
        new window.KeyboardEvent('keydown', { key: 'Escape' }),
      );
    });

    assert.strictEqual(cancelled, true);
    await cleanup();
  });
});
