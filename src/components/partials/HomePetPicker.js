import { Link } from 'react-router-dom';

export default function HomePetPicker({
  pets,
  selectedPetId,
  onSelectPet,
  loadingPets,
}) {
  if (loadingPets) {
    return (
      <div className="home-pet-picker">
        <p>Loading pets…</p>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="home-pet-picker">
        <p>Add a pet to start logging care.</p>
        <Link to="/pet/new/">Add your pet</Link>
      </div>
    );
  }

  const selectedPet = pets.find((p) => String(p.id) === String(selectedPetId));

  return (
    <div className="home-pet-picker">
      <label htmlFor="home-pet-select">Logging care for:</label>
      <select
        id="home-pet-select"
        value={selectedPetId}
        onChange={(e) => onSelectPet(e.target.value)}
      >
        <option value="">Select a pet</option>
        {pets.map((pet) => (
          <option key={pet.id} value={pet.id}>
            {pet.name}
          </option>
        ))}
      </select>
      {selectedPetId && selectedPet && (
        <p className="home-pet-picker-hint">
          All cards below apply to <strong>{selectedPet.name}</strong> until you choose another pet.{' '}
          <Link to={`/pet/${selectedPetId}/diary/`}>View calendar</Link>
        </p>
      )}
      {!selectedPetId && (
        <p className="home-pet-picker-hint">Choose a pet to enable Health, Daily needs, and Appointments.</p>
      )}
    </div>
  );
}
