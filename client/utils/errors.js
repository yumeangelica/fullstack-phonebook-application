// Extract a human-readable message from an API error response
export const getErrorMessage = (
  error,
  fallback = 'An unexpected error occurred',
) =>
  error.response?.data?.error ||
  error.response?.data?.details?.join(', ') ||
  error.message ||
  fallback;
