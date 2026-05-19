import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function TableDatePicker({ selected, onChange }) {
  return (
    <div className="daily-date-picker">
      <label htmlFor="daily-log-datetime" className="daily-date-picker-label">
        Date &amp; time for this log:
      </label>
      <DatePicker
        id="daily-log-datetime"
        showTimeSelect
        dateFormat="MMMM d, yyyy h:mmaa"
        selected={selected}
        onChange={(date) => onChange(date || new Date())}
        popperPlacement="bottom"
        popperProps={{ strategy: 'fixed' }}
      />
    </div>
  );
}
