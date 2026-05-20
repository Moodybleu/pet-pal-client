import { getLocalDateKey } from './dailyCheckState';

const LEGACY_KEY = 'petPalCustomDailyChecks';
const STORE_KEY = 'petPalCustomCareByPet';

export const SCHEDULE_ONGOING = 'ongoing';
export const SCHEDULE_LIMITED = 'limited';

function parseDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(dateKey, days) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return getLocalDateKey(date);
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function normalizeItem(item) {
  const startDate = item.startDate || getLocalDateKey();
  const schedule = item.schedule === SCHEDULE_LIMITED ? SCHEDULE_LIMITED : SCHEDULE_ONGOING;
  const days =
    schedule === SCHEDULE_LIMITED ? Math.max(1, Number(item.days) || 1) : null;

  return {
    id: item.id,
    label: String(item.label || '').trim(),
    schedule,
    startDate,
    days,
  };
}

export function isItemActive(item, todayKey = getLocalDateKey()) {
  const normalized = normalizeItem(item);
  if (!normalized.label) return false;

  if (normalized.schedule === SCHEDULE_ONGOING) {
    return true;
  }

  const endDate = addDays(normalized.startDate, normalized.days - 1);
  return todayKey <= endDate;
}

export function getItemScheduleNote(item, todayKey = getLocalDateKey()) {
  const normalized = normalizeItem(item);

  if (normalized.schedule === SCHEDULE_ONGOING) {
    return 'Every day';
  }

  const endDate = addDays(normalized.startDate, normalized.days - 1);
  if (todayKey > endDate) {
    return 'Ended';
  }

  const start = parseDateKey(todayKey);
  const end = parseDateKey(endDate);
  const daysLeft =
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  if (daysLeft <= 1) {
    return 'Last day';
  }

  return `${daysLeft} days left`;
}

function migrateLegacyForPet(store, petId) {
  try {
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (!legacyRaw) return store;

    const legacy = JSON.parse(legacyRaw);
    if (!Array.isArray(legacy) || legacy.length === 0) return store;

    const existing = store[petId] || [];
    const merged = [...existing];

    legacy.forEach((entry) => {
      const label = String(entry?.label || '').trim();
      if (!label) return;
      const duplicate = merged.some(
        (item) => item.label.toLowerCase() === label.toLowerCase()
      );
      if (duplicate) return;

      merged.push(
        normalizeItem({
          id: entry.id || `custom-${Date.now()}`,
          label,
          schedule: SCHEDULE_ONGOING,
          startDate: getLocalDateKey(),
        })
      );
    });

    store[petId] = merged;
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // ignore bad legacy data
  }

  return store;
}

export function loadCustomCareItems(petId) {
  if (!petId) return [];

  let store = loadStore();
  store = migrateLegacyForPet(store, String(petId));

  const items = (store[String(petId)] || []).map(normalizeItem);
  const active = items.filter((item) => isItemActive(item));

  if (active.length !== items.length) {
    store[String(petId)] = active;
    saveStore(store);
  }

  return active;
}

export function saveCustomCareItems(petId, items) {
  if (!petId) return;

  const store = loadStore();
  store[String(petId)] = items.map(normalizeItem).filter((item) => item.label);
  saveStore(store);
}

export function newCustomCareId() {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
