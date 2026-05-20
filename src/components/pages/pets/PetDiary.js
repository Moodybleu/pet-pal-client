import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../../utils/petsApi';
import './PetDiary.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function buildCalendarCells(year, month) {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ day: null, dateKey: null });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ day, dateKey });
  }
  return cells;
}

function formatError(err) {
  if (!err.response) {
    return 'Could not reach the server. Make sure Django is running on port 8000.';
  }
  const data = err.response.data;
  if (typeof data === 'string') return data;
  if (data?.detail) return String(data.detail);
  if (typeof data === 'object') {
    return Object.entries(data)
      .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
      .join(' · ');
  }
  return 'Could not load this diary.';
}

function DiaryEntryDropdown({ entry }) {
  return (
    <details className="diary-entry">
      <summary>{entry.label}</summary>
      {entry.fields?.length > 0 ? (
        <ul className="diary-entry-fields">
          {entry.fields.map((field) => (
            <li key={`${entry.id}-${field.label}`}>
              <strong>{field.label}:</strong> {field.value}
            </li>
          ))}
        </ul>
      ) : (
        <p className="diary-entry-empty">No details recorded.</p>
      )}
    </details>
  );
}

export default function PetDiary() {
  const { petId } = useParams();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [pet, setPet] = useState(null);
  const [entriesByDate, setEntriesByDate] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDiary = useCallback(async () => {
    if (!petId) {
      setErrorMessage('Invalid pet link.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api.get(`/api/pet/${petId}/diary/`, {
        params: { year, month },
      });
      setPet(response.data.pet || null);
      setEntriesByDate(response.data.entries_by_date || {});
    } catch (err) {
      console.warn(err);
      setErrorMessage(formatError(err));
      setPet(null);
      setEntriesByDate({});
    } finally {
      setLoading(false);
    }
  }, [petId, year, month]);

  useEffect(() => {
    loadDiary();
  }, [loadDiary]);

  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  };

  const cells = buildCalendarCells(year, month);
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const petName = pet?.name || 'Pet';

  return (
    <div className="pet-diary-page">
      <p className="diary-back">
        <Link to="/user/profile/">← Back to profile</Link>
      </p>

      <h1 className="pet-page-title">
        {petId ? (
          <Link to={`/pet/${petId}/profile/`}>{petName}&apos;s profile</Link>
        ) : (
          <span>{petName}&apos;s profile</span>
        )}
        <span className="pet-page-title-separator" aria-hidden="true">
          |
        </span>
        <span className="pet-page-title-current">Diary</span>
      </h1>
      {pet?.breed && <p className="diary-subtitle">{pet.breed}</p>}

      {loading && <p className="diary-status">Loading calendar…</p>}
      {errorMessage && (
        <div className="diary-error-box" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="diary-toolbar">
        <button type="button" onClick={goToPreviousMonth} aria-label="Previous month">
          ‹
        </button>
        <h2>
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <button type="button" onClick={goToNextMonth} aria-label="Next month">
          ›
        </button>
        <button type="button" className="diary-today-btn" onClick={goToToday}>
          Today
        </button>
      </div>

      <p className="diary-hint">Days with records show a dropdown you can open for details.</p>

      <div className="diary-calendar">
        <div className="diary-weekdays">
          {WEEKDAYS.map((name) => (
            <div key={name} className="diary-weekday">
              {name}
            </div>
          ))}
        </div>
        <div className="diary-grid">
          {cells.map((cell, index) => {
            if (cell.day === null) {
              return <div key={`empty-${index}`} className="diary-day diary-day--empty" />;
            }

            const dayEntries = entriesByDate[cell.dateKey] || [];
            const isToday = cell.dateKey === todayKey;

            return (
              <div
                key={cell.dateKey}
                className={`diary-day${isToday ? ' diary-day--today' : ''}${dayEntries.length ? ' diary-day--has-entries' : ''}`}
              >
                <span className="diary-day-number">{cell.day}</span>
                <div className="diary-day-entries">
                  {dayEntries.map((entry) => (
                    <DiaryEntryDropdown key={`${entry.type}-${entry.id}`} entry={entry} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {petId && (
        <p className="diary-actions">
          <Link to={`/pet/${petId}/profile/`} className="diary-link-btn diary-link-btn--secondary">
            {petName}&apos;s profile
          </Link>
          <Link to={`/pet/${petId}/vet/`} className="diary-link-btn">
            Log a vet visit
          </Link>
          <Link to={`/pet/${petId}/appointment/`} className="diary-link-btn diary-link-btn--secondary">
            Log an appointment
          </Link>
          <Link to="/" className="diary-link-btn diary-link-btn--secondary">
            Log daily care
          </Link>
        </p>
      )}
    </div>
  );
}
