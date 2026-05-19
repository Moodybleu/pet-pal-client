import { useEffect, useState } from 'react';
import {
  animated,
  useSpring,
  config,
  useSpringRef,
  useChain,
} from 'react-spring';
import {
  getLocalDateKey,
  isDailyCheckChecked,
  setDailyCheckChecked,
} from '../../../utils/dailyCheckState';

export default function DailyCheckbox({
  label,
  checkId,
  petId,
  onLog,
  disabled,
  saving,
  className = '',
}) {
  const [isChecked, setIsChecked] = useState(() =>
    isDailyCheckChecked(petId, checkId, getLocalDateKey())
  );

  useEffect(() => {
    setIsChecked(isDailyCheckChecked(petId, checkId, getLocalDateKey()));
  }, [petId, checkId]);

  const checkboxAnimationRef = useSpringRef();
  const checkboxAnimationStyle = useSpring({
    backgroundColor: isChecked ? '#808' : '#fff',
    borderColor: isChecked ? '#808' : '#ddd',
    config: config.gentle,
    ref: checkboxAnimationRef,
  });

  const [checkmarkLength, setCheckmarkLength] = useState(null);

  const checkmarkAnimationRef = useSpringRef();
  const checkmarkAnimationStyle = useSpring({
    x: isChecked ? 0 : checkmarkLength,
    config: config.gentle,
    ref: checkmarkAnimationRef,
  });

  useChain(
    isChecked
      ? [checkboxAnimationRef, checkmarkAnimationRef]
      : [checkmarkAnimationRef, checkboxAnimationRef],
    [0, 0.1]
  );

  const handleChange = async () => {
    const nextChecked = !isChecked;
    const dateKey = getLocalDateKey();

    if (nextChecked) {
      setIsChecked(true);
      if (onLog) {
        const ok = await onLog();
        if (ok) {
          setDailyCheckChecked(petId, checkId, true, dateKey);
        } else {
          setIsChecked(false);
        }
      } else {
        setDailyCheckChecked(petId, checkId, true, dateKey);
      }
      return;
    }

    setIsChecked(false);
    setDailyCheckChecked(petId, checkId, false, dateKey);
  };

  return (
    <div className={`daily-check-item ${className}`.trim()}>
      <label className={`daily-food-label${disabled ? ' daily-food-label--disabled' : ''}`}>
        <input
          type="checkbox"
          checked={isChecked}
          disabled={disabled || saving}
          onChange={handleChange}
        />
        <animated.svg
          style={checkboxAnimationStyle}
          className={`checkbox ${isChecked ? 'checkbox--active' : ''}`}
          aria-hidden="true"
          viewBox="0 0 15 11"
          fill="none"
        >
          <animated.path
            d="M1 4.5L5 9L14 1"
            strokeWidth="2"
            stroke="#fff"
            ref={(ref) => {
              if (ref) {
                setCheckmarkLength(ref.getTotalLength());
              }
            }}
            strokeDasharray={checkmarkLength}
            strokeDashoffset={checkmarkAnimationStyle.x}
          />
        </animated.svg>
        {label}
      </label>
    </div>
  );
}
