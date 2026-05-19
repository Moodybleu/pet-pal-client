import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../utils/petsApi';
import Food from './Food';
import CustomDailyChecks from './CustomDailyChecks';
import ActivityLog from './ActivityLog';
import PottyTrip from './Potty_trip';
import TableDatePicker from './TableDatePicker';

function toDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatLoggedAt(d) {
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function slugifyLogType(label) {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return slug || 'custom';
}

export default function Daily({
  isLoggedIn: isLoggedInProp,
  selectedPetId = '',
  pets = [],
  loadingPets = false,
}) {
  const isLoggedIn = isLoggedInProp || Boolean(localStorage.getItem('jwt'));
  const [logDateTime, setLogDateTime] = useState(() => new Date());
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const saveDailyLog = useCallback(
    async (logType, details = '', schedule = '') => {
      if (!selectedPetId) {
        setErrorMessage('Select a pet above to log daily care.');
        return false;
      }

      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const timeNote = `Logged at ${formatLoggedAt(logDateTime)}`;
      const fullDetails = details ? `${details}. ${timeNote}` : timeNote;

      try {
        await api.post('/api/daily/', {
          pet: Number(selectedPetId),
          date: toDateKey(logDateTime),
          log_type: logType,
          details: fullDetails,
          daily_schedule: schedule,
        });
        const petName =
          pets.find((p) => String(p.id) === String(selectedPetId))?.name || 'your pet';
        setSuccessMessage(`Saved for ${petName}! Check their diary calendar.`);
        return true;
      } catch (err) {
        console.warn(err);
        setErrorMessage('Could not save daily log. Is the server running?');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [selectedPetId, logDateTime, pets]
  );

  const controlsDisabled = !selectedPetId || saving;

  if (!isLoggedIn) {
    return (
      <div className="daily-card">
        <h1 className="text-2xl daily-card-heading">Daily needs</h1>
        <p>
          <Link to="/user/login/">Log in</Link> to log daily care for your pets.
        </p>
      </div>
    );
  }

  if (!loadingPets && pets.length === 0) {
    return (
      <div className="daily-card">
        <h1 className="text-2xl daily-card-heading">Daily needs</h1>
        <p>Add a pet before logging daily care.</p>
        <Link to="/pet/new/">Add your pet</Link>
      </div>
    );
  }

  return (
    <div className="daily-card">
      <h1 className="text-2xl daily-card-heading">Daily needs</h1>

      {errorMessage && <p className="diary-error daily-card-message">{errorMessage}</p>}
      {successMessage && <p className="vet-form-success daily-card-message">{successMessage}</p>}

      <div className="daily-needs-section">
        <Food
          onLogBreakfast={() => saveDailyLog('breakfast', 'Breakfast')}
          onLogDinner={() => saveDailyLog('dinner', 'Dinner')}
          disabled={controlsDisabled}
          saving={saving}
        />
        <CustomDailyChecks
          onLogItem={(label) => saveDailyLog(slugifyLogType(label), label)}
          disabled={controlsDisabled}
          saving={saving}
        />
        <TableDatePicker selected={logDateTime} onChange={setLogDateTime} />
      </div>

      <ActivityLog
        onLogActivity={(logType, details) => saveDailyLog(logType, details)}
        disabled={controlsDisabled}
        saving={saving}
      />

      <hr className="daily-card-divider" aria-hidden="true" />

      <section className="potty-timer-section" aria-label="Potty training timer">
        <PottyTrip
          onLogPotty={() => saveDailyLog('potty', 'Potty training timer completed')}
          onLogPottyBreak={() => saveDailyLog('potty', 'Potty break logged')}
          disabled={controlsDisabled}
          saving={saving}
        />
      </section>

      {selectedPetId && (
        <p className="vet-form-more-fields">
          <Link to={`/pet/${selectedPetId}/diary/`}>
            View on {pets.find((p) => String(p.id) === selectedPetId)?.name || 'pet'}&apos;s calendar
          </Link>
        </p>
      )}
    </div>
  );
}
