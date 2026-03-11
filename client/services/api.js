const baseURL = '/api';
const personsEndpoint = '/persons';

const DEFAULT_TIMEOUT = 10000;

const request = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT);

  try {
    const headers = options.body ? { 'Content-Type': 'application/json' } : {};

    const response = await fetch(`${baseURL}${url}`, {
      ...options,
      headers: { ...headers, ...options.headers },
      signal: controller.signal,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      const error = new Error(data?.error || response.statusText);
      error.response = { data, status: response.status };
      throw error;
    }

    return { data, status: response.status };
  } finally {
    clearTimeout(timeoutId);
  }
};

const getAllPersons = () => request(personsEndpoint);

const createPerson = (newPerson) =>
  request(personsEndpoint, { method: 'POST', body: JSON.stringify(newPerson) });

const updatePerson = (id, updatedDetails) =>
  request(`${personsEndpoint}/${id}`, { method: 'PUT', body: JSON.stringify(updatedDetails) });

const removePerson = (id) =>
  request(`${personsEndpoint}/${id}`, { method: 'DELETE' });

export default {
  getAllPersons,
  createPerson,
  updatePerson,
  removePerson,
};
