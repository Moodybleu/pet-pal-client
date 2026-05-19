const STORAGE_KEY = 'petPalDailyChecks';

export function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function entryKey(petId, checkId) {
  return `${petId}|${checkId}`;
}

/** True if this pet/check was marked done for the given local calendar day. */
export function isDailyCheckChecked(petId, checkId, dateKey = getLocalDateKey()) {
  if (!petId || !checkId) return false;
  const store = loadStore();
  return store[entryKey(petId, checkId)] === dateKey;
}

export function setDailyCheckChecked(petId, checkId, checked, dateKey = getLocalDateKey()) {
  if (!petId || !checkId) return;
  const store = loadStore();
  const key = entryKey(petId, checkId);

  if (checked) {
    store[key] = dateKey;
  } else {
    delete store[key];
  }

  saveStore(store);
}
