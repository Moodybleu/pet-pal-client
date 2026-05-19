import { useState } from 'react';
import DailyCheckbox from './DailyCheckbox';

const STORAGE_KEY = 'petPalCustomDailyChecks';

function loadCustomItems() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function newItemId() {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function CustomDailyChecks({ onLogItem, disabled, saving }) {
  const [items, setItems] = useState(loadCustomItems);
  const [newLabel, setNewLabel] = useState('');

  const persistItems = (nextItems) => {
    setItems(nextItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) return;

    const exists = items.some((item) => item.label.toLowerCase() === label.toLowerCase());
    if (exists) {
      setNewLabel('');
      return;
    }

    persistItems([...items, { id: newItemId(), label }]);
    setNewLabel('');
  };

  const handleRemove = (id) => {
    persistItems(items.filter((item) => item.id !== id));
  };

  return (
    <section className="custom-daily-checks" aria-labelledby="custom-daily-heading">
      <h2 id="custom-daily-heading" className="custom-daily-heading">
        Custom care
      </h2>
      <p className="custom-daily-hint">Add vitamins, medicine, or anything else you track daily.</p>

      {items.length > 0 && (
        <div className="custom-daily-list">
          {items.map((item) => (
            <div key={item.id} className="custom-daily-row">
              <DailyCheckbox
                label={item.label}
                onLog={() => onLogItem(item.label)}
                disabled={disabled}
                saving={saving}
              />
              <button
                type="button"
                className="custom-daily-remove"
                onClick={() => handleRemove(item.id)}
                aria-label={`Remove ${item.label}`}
                title={`Remove ${item.label}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <form className="custom-daily-add" onSubmit={handleAdd}>
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="e.g. Vitamins with meal"
          maxLength={80}
          aria-label="New daily care item"
        />
        <button type="submit" className="daily-log-btn" disabled={!newLabel.trim()}>
          Add
        </button>
      </form>
    </section>
  );
}
