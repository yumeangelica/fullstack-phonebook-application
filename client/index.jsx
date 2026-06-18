import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import './css/index.css';

import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { ConfirmProvider } from './hooks/useConfirm';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <ErrorBoundary>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </ErrorBoundary>
  </StrictMode>,
);
