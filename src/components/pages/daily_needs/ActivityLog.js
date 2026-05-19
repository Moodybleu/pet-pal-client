import { useState } from 'react';

const ACTIVITIES = [
  { type: 'walk', label: 'Walk' },
  { type: 'park', label: 'Park visit' },
  { type: 'run', label: 'Ran around' },
  { type: 'play_outside', label: 'Outdoor play' },
  { type: 'swim', label: 'Swim' },
  { type: 'hike', label: 'Hike / adventure' },
  { type: 'yard', label: 'Yard or garden' },
  { type: 'explore', label: 'Explored outside' },
  { type: 'fetch', label: 'Played fetch' },
  { type: 'train', label: 'Training session' },
];

const DURATION_PRESETS = [
  { amount: '15', unit: 'minutes', label: '15 min' },
  { amount: '30', unit: 'minutes', label: '30 min' },
  { amount: '1', unit: 'hours', label: '1 hr' },
  { amount: '2', unit: 'hours', label: '2 hr' },
];

function buildActivityDetails(label, durationAmount, durationUnit, whereHow) {
  const parts = [label];

  const amount = Number(durationAmount);
  if (durationAmount && !Number.isNaN(amount) && amount > 0) {
    let unitLabel = durationUnit;
    if (amount === 1) {
      unitLabel = durationUnit === 'hours' ? 'hour' : 'minute';
    }
    parts.push(`Duration: ${amount} ${unitLabel}`);
  }

  const place = whereHow?.trim();
  if (place) {
    parts.push(`Where/how: ${place}`);
  }

  return parts.join(' · ');
}

export default function ActivityLog({ onLogActivity, disabled, saving }) {
  const [selected, setSelected] = useState(null);
  const [durationAmount, setDurationAmount] = useState('');
  const [durationUnit, setDurationUnit] = useState('minutes');
  const [whereHow, setWhereHow] = useState('');

  const resetForm = () => {
    setSelected(null);
    setDurationAmount('');
    setDurationUnit('minutes');
    setWhereHow('');
  };

  const applyPreset = (amount, unit) => {
    setDurationAmount(amount);
    setDurationUnit(unit);
  };

  const handleSelectActivity = (activity) => {
    setSelected(activity);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;

    const details = buildActivityDetails(
      selected.label,
      durationAmount,
      durationUnit,
      whereHow
    );
    const ok = await onLogActivity(selected.type, details);
    if (ok) {
      resetForm();
    }
  };

  const formDisabled = disabled || saving;

  return (
    <section className="daily-activity-section" aria-labelledby="daily-activity-heading">
      <h2 id="daily-activity-heading" className="daily-activity-heading">
        Log activity
      </h2>
      <p className="daily-activity-prompt">
        Choose an activity, then add how long and where if you like. Works for any pet.
      </p>

      <div className="daily-activity-grid" role="group" aria-label="Activity types">
        {ACTIVITIES.map((activity) => {
          const isSelected = selected?.type === activity.type;
          return (
            <button
              key={activity.type}
              type="button"
              className={`daily-activity-btn${isSelected ? ' daily-activity-btn--selected' : ''}`}
              onClick={() => handleSelectActivity(activity)}
              disabled={formDisabled}
              aria-pressed={isSelected}
            >
              {activity.label}
            </button>
          );
        })}
      </div>

      {selected && (
        <form className="daily-activity-form" onSubmit={handleSubmit}>
          <p className="daily-activity-form-title">Logging: {selected.label}</p>

          <div className="daily-activity-field">
            <label htmlFor="activity-duration-amount">How long? (optional)</label>
            <div className="daily-activity-duration-row">
              <input
                id="activity-duration-amount"
                type="number"
                min="1"
                max="999"
                step="1"
                className="daily-activity-input daily-activity-input--short"
                placeholder="30"
                value={durationAmount}
                onChange={(e) => setDurationAmount(e.target.value)}
                disabled={formDisabled}
              />
              <select
                id="activity-duration-unit"
                className="daily-activity-select"
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value)}
                disabled={formDisabled}
                aria-label="Duration unit"
              >
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
              </select>
            </div>
            <div className="daily-activity-presets" role="group" aria-label="Quick duration">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="daily-activity-preset-btn"
                  onClick={() => applyPreset(preset.amount, preset.unit)}
                  disabled={formDisabled}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="daily-activity-field">
            <label htmlFor="activity-where-how">Where or how? (optional)</label>
            <input
              id="activity-where-how"
              type="text"
              className="daily-activity-input"
              placeholder="e.g. dog park, backyard, pool, fetch"
              value={whereHow}
              onChange={(e) => setWhereHow(e.target.value)}
              disabled={formDisabled}
              maxLength={200}
            />
          </div>

          <div className="daily-activity-form-actions">
            <button
              type="button"
              className="daily-activity-cancel-btn"
              onClick={resetForm}
              disabled={formDisabled}
            >
              Cancel
            </button>
            <button type="submit" className="daily-activity-save-btn" disabled={formDisabled}>
              {saving ? 'Saving…' : 'Save activity'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
