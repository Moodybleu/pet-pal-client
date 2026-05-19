export default function Walk({ onLogWalk, disabled, saving }) {
  return (
    <div className="daily-walk">
      <p className="daily-walk-prompt">Wanna go on a walk?</p>
      <button type="button" className="daily-log-btn" onClick={onLogWalk} disabled={disabled}>
        {saving ? 'Saving…' : 'Log walk'}
      </button>
    </div>
  );
}
