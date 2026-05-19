import { useTimer } from 'react-timer-hook';

function PottyTimer({ expiryTimestamp, onLogPotty, onLogPottyBreak, disabled, saving }) {
  const { seconds, minutes, isRunning, start, pause, resume, restart } = useTimer({
    expiryTimestamp,
    autoStart: false,
    onExpire: () => {
      if (onLogPotty && !disabled) {
        onLogPotty();
      }
    },
  });

  return (
    <div className="potty-timer">
      <p className="potty-timer-title">Potty training timer</p>
      <div className="potty-timer-display">
        <span className="potty-timer-segment">
          <span className="potty-timer-value">{String(minutes).padStart(2, '0')}</span>
          <span className="potty-timer-label">min</span>
        </span>
        <span className="potty-timer-separator">:</span>
        <span className="potty-timer-segment">
          <span className="potty-timer-value">{String(seconds).padStart(2, '0')}</span>
          <span className="potty-timer-label">sec</span>
        </span>
      </div>
      <p className="potty-timer-status">{isRunning ? 'Running' : 'Paused'}</p>
      <div className="potty-timer-controls">
        <button type="button" onClick={start} disabled={disabled}>
          Start
        </button>
        <button type="button" onClick={pause} disabled={disabled}>
          Pause
        </button>
        <button type="button" onClick={resume} disabled={disabled}>
          Resume
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            const time = new Date();
            time.setSeconds(time.getSeconds() + 900);
            restart(time);
          }}
        >
          Restart
        </button>
        {onLogPottyBreak && (
          <button
            type="button"
            className="daily-log-btn"
            onClick={onLogPottyBreak}
            disabled={disabled}
          >
            {saving ? 'Saving…' : 'Log potty break'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function PottyTrip(props) {
  const time = new Date();
  time.setSeconds(time.getSeconds() + 900);
  return <PottyTimer expiryTimestamp={time} {...props} />;
}
