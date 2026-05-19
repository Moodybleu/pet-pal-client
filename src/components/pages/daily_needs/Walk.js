export default function Walk({ onLogWalk, disabled, saving }) {
  return (
    <section className="daily-walk-section" aria-labelledby="daily-walk-heading">
      <h2 id="daily-walk-heading" className="daily-walk-heading">
        Log a walk
      </h2>
      <p className="daily-walk-prompt">
        Record outdoor time and exercise. Walks show up on your pet&apos;s diary calendar.
      </p>
      <button
        type="button"
        className="daily-walk-btn"
        onClick={onLogWalk}
        disabled={disabled}
      >
        {saving ? 'Saving…' : 'Log walk'}
      </button>
    </section>
  );
}
