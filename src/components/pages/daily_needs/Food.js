import DailyCheckbox from './DailyCheckbox';

export default function Food({ petId, onLogBreakfast, onLogDinner, disabled, saving }) {
  return (
    <section className="feed-my-pet" aria-labelledby="feed-my-pet-heading">
      <h2 id="feed-my-pet-heading" className="feed-my-pet-heading">
        Feed my pet
      </h2>
      <div className="feed-meals-row">
        <DailyCheckbox
          label="Breakfast"
          checkId="breakfast"
          petId={petId}
          onLog={onLogBreakfast}
          disabled={disabled}
          saving={saving}
          className="feed-meal-subsection"
        />
        <DailyCheckbox
          label="Dinner"
          checkId="dinner"
          petId={petId}
          onLog={onLogDinner}
          disabled={disabled}
          saving={saving}
          className="feed-meal-subsection"
        />
      </div>
    </section>
  );
}
