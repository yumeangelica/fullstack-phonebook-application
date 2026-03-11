import { useState, useCallback } from 'react';

const AuthForm = ({ onLogin, onRegister, showNotification }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  }, []);

  const toggleMode = useCallback(() => {
    setIsLoginMode(prev => !prev);
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    if (!username.trim() || !password) {
      showNotification('Please fill in all fields', true);
      return;
    }

    if (!isLoginMode) {
      if (username.trim().length < 3) {
        showNotification('Username must be at least 3 characters', true);
        return;
      }
      if (password.length < 8) {
        showNotification('Password must be at least 8 characters', true);
        return;
      }
      if (password !== confirmPassword) {
        showNotification('Passwords do not match', true);
        return;
      }
    }

    setSubmitting(true);

    try {
      if (isLoginMode) {
        await onLogin(username.trim(), password);
      } else {
        await onRegister(username.trim(), password);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error
        || error.message
        || 'An unexpected error occurred';
      showNotification(errorMessage, true);
    } finally {
      setSubmitting(false);
    }
  }, [username, password, confirmPassword, isLoginMode, onLogin, onRegister, showNotification]);

  const isFormValid = isLoginMode
    ? username.trim().length > 0 && password.length > 0
    : username.trim().length >= 3 && password.length >= 8 && password === confirmPassword;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Phonebook</h1>
        <p className="auth-subtitle">
          {isLoginMode ? 'Sign in to your account' : 'Create a new account'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              id="username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              autoFocus
              disabled={submitting}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLoginMode ? 'Enter password' : 'Min. 8 characters'}
              autoComplete={isLoginMode ? 'current-password' : 'new-password'}
              disabled={submitting}
            />
          </div>

          {!isLoginMode && (
            <div className="auth-field">
              <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                autoComplete="new-password"
                disabled={submitting}
              />
            </div>
          )}

          <button
            type="submit"
            className={`submit-btn auth-submit ${!isFormValid || submitting ? 'disabled' : ''}`}
            disabled={!isFormValid || submitting}
          >
            {submitting
              ? <span className="loading-spinner" />
              : isLoginMode ? 'Sign in' : 'Create account'
            }
          </button>
        </form>

        <div className="auth-toggle">
          <span className="auth-toggle-text">
            {isLoginMode ? 'No account yet?' : 'Already have an account?'}
          </span>
          <button
            type="button"
            className="auth-toggle-btn"
            onClick={toggleMode}
            disabled={submitting}
          >
            {isLoginMode ? 'Create one' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
