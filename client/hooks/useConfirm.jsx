import { createContext, useCallback, useContext, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

const ConfirmContext = createContext(null);

/**
 * Provides a promise-based confirmation dialog. Wrap the app once and call the
 * returned confirm() from any component or hook:
 *
 *   const confirm = useConfirm();
 *   if (await confirm({ message: 'Delete?' })) { ... }
 */
export const ConfirmProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback((options) => {
    const config =
      typeof options === 'string' ? { message: options } : options || {};

    return new Promise((resolve) => {
      setDialog({ ...config, resolve });
    });
  }, []);

  const handleResolve = useCallback(
    (result) => {
      dialog?.resolve(result);
      setDialog(null);
    },
    [dialog],
  );

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <ConfirmDialog
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          cancelLabel={dialog.cancelLabel}
          onConfirm={() => handleResolve(true)}
          onCancel={() => handleResolve(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
};

const useConfirm = () => {
  const confirm = useContext(ConfirmContext);

  if (!confirm) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }

  return confirm;
};

export default useConfirm;
