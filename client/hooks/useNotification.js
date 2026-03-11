import { useState, useCallback, useEffect, useRef } from 'react';

const useNotification = (duration = 3000) => {
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const timerRef = useRef(null);

  const showNotification = useCallback((text, error = false) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setMessage(text);
    setIsError(error);

    timerRef.current = setTimeout(() => {
      setMessage(null);
      setIsError(false);
      timerRef.current = null;
    }, duration);
  }, [duration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { message, isError, showNotification };
};

export default useNotification;
