export function parsePetList(data) {
  if (Array.isArray(data)) {
    return data;
  }
  if (data?.results && Array.isArray(data.results)) {
    return data.results;
  }
  return [];
}

export function formatApiError(err, fallback) {
  if (!err.response) {
    return 'Could not reach the server. Is Django running on port 8000?';
  }

  const { data, status } = err.response;
  const text = typeof data === 'string' ? data : '';

  if (text.includes('no such column') && text.includes('photo')) {
    return 'Database needs an update. In petpal-server run: python manage.py migrate';
  }

  if (status === 500 && !data?.detail) {
    return 'Server error loading pets. Check that migrations are applied and Pillow is installed.';
  }

  if (data?.detail) {
    return String(data.detail);
  }

  if (typeof data === 'object' && data !== null) {
    const message = Object.entries(data)
      .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
      .join(' · ');
    if (message) return message;
  }

  if (text) {
    return text.length > 180 ? `${text.slice(0, 180)}…` : text;
  }

  return fallback;
}
