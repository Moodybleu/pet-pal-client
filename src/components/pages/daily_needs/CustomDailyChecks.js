import { useEffect, useState } from 'react';
import DailyCheckbox from './DailyCheckbox';
import {
  getItemScheduleNote,
  loadCustomCareItems,
  newCustomCareId,
  saveCustomCareItems,
  SCHEDULE_LIMITED,
  SCHEDULE_ONGOING,
} from '../../../utils/customCareStorage';
import { getLocalDateKey } from '../../../utils/dailyCheckState';

export default function CustomDailyChecks({ petId, onLogItem, disabled, saving }) {
  const [items, setItems] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [scheduleType, setScheduleType] = useState(SCHEDULE_ONGOING);
  const [durationDays, setDurationDays] = useState('7');

  useEffect(() => {
    setItems(loadCustomCareItems(petId));
  }, [petId]);

  const persistItems = (nextItems) => {
    setItems(nextItems);
    saveCustomCareItems(petId, nextItems);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label || !petId) return;

    const exists = items.some((item) => item.label.toLowerCase() === label.toLowerCase());
    if (exists) {
      setNewLabel('');
      return;
    }

    const item = {
      id: newCustomCareId(),
      label,
      schedule: scheduleType,
      startDate: getLocalDateKey(),
      days: scheduleType === SCHEDULE_LIMITED ? Number(durationDays) || 7 : null,
    };

    persistItems([...items, item]);
    setNewLabel('');
    setScheduleType(SCHEDULE_ONGOING);
    setDurationDays('7');
  };

  const handleRemove = (id) => {
    persistItems(items.filter((item) => item.id !== id));
  };

  const formDisabled = disabled || saving || !petId;

  return (
    <section className="custom-daily-checks" aria-labelledby="custom-daily-heading">
      <h2 id="custom-daily-heading" className="custom-daily-heading">
        Custom care
      </h2>
      <p className="custom-daily-hint">
        Ongoing items stay on your list (like daily vitamins). Timed items run for the
        number of days you choose, then remove themselves.
      </p>

      {!petId && (
        <p className="custom-daily-hint custom-daily-hint--warn">
          Select a pet above to save custom care items.
        </p>
      )}

      {items.length > 0 && (
        <div className="custom-daily-list">
          {items.map((item) => (
            <div key={item.id} className="custom-daily-row">
              <div className="custom-daily-row-main">
                <DailyCheckbox
                  label={item.label}
                  checkId={item.id}
                  petId={petId}
                  onLog={() => onLogItem(item.label)}
                  disabled={formDisabled}
                  saving={saving}
                />
                <span className="custom-daily-schedule-badge">
                  {getItemScheduleNote(item)}
                </span>
              </div>
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

      <form className="custom-daily-add-form" onSubmit={handleAdd}>
        <div className="custom-daily-add">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="e.g. Multivitamin or antibiotic"
            maxLength={80}
            aria-label="New daily care item"
            disabled={formDisabled}
          />
          <button type="submit" className="daily-log-btn" disabled={formDisabled || !newLabel.trim()}>
            Add
          </button>
        </div>

        <fieldset className="custom-daily-schedule-options" disabled={formDisabled}>
          <legend className="custom-daily-schedule-legend">How long?</legend>
          <label className="custom-daily-schedule-option">
            <input
              type="radio"
              name="custom-care-schedule"
              value={SCHEDULE_ONGOING}
              checked={scheduleType === SCHEDULE_ONGOING}
              onChange={() => setScheduleType(SCHEDULE_ONGOING)}
            />
            Every day (stays until you remove it)
          </label>
          <label className="custom-daily-schedule-option">
            <input
              type="radio"
              name="custom-care-schedule"
              value={SCHEDULE_LIMITED}
              checked={scheduleType === SCHEDULE_LIMITED}
              onChange={() => setScheduleType(SCHEDULE_LIMITED)}
            />
            For a set number of days
          </label>
          {scheduleType === SCHEDULE_LIMITED && (
            <div className="custom-daily-days-row">
              <label htmlFor="custom-care-days">Number of days</label>
              <input
                id="custom-care-days"
                type="number"
                min="1"
                max="365"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="custom-daily-days-input"
              />
            </div>
          )}
        </fieldset>
      </form>
    </section>
  );
}
