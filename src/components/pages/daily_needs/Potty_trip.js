import React from 'react';
import { useTimer } from 'react-timer-hook';

function MyTimer({ expiryTimestamp, autoStart }) {
  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({ expiryTimestamp, autoStart: false ,onExpire: () => console.warn('Timer Complete') });


  return (
    <div style={{textAlign: 'center'}}>
      <p className="text-2xl">Potty training timer</p>
      <div style={{fontSize: '100px'}}>
        <span>{days}</span>:<span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
      </div>
      <p>{isRunning ? 'Started' : 'Paused'}</p>
      <button onClick={start}>Start</button>
      <button onClick={pause}>Pause</button>
      <button onClick={resume}>Resume</button>
      <button onClick={() => {
        // Restarts to 15 minutes timer
        const time = new Date();
        time.setSeconds(time.getSeconds() + 900); // 15 minute timer
        restart(time)
      }}>Restart</button>
    </div>
  );
}

export default function App() {
  const time = new Date();
  time.setSeconds(time.getSeconds() + 900); // 15 minutes timer
  return (
    <div>
      <MyTimer expiryTimestamp={time} />
    </div>
  );
}