import { Link } from 'react-router-dom';
import VetForm from './VetForm';

export default function SelectionCards({ isLoggedIn, selectedPetId, pets, hidePetPicker }) {
  if (!isLoggedIn) {
    return (
      <div>
        <h1 className="text-2xl">Health</h1>
        <p>
          <Link to="/user/login/">Log in</Link> to log vet visits for your pets.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl">Health</h1>
      <VetForm
        compact
        showBackLink={false}
        petId={selectedPetId}
        hidePetPicker={hidePetPicker}
        pets={pets}
      />
    </div>
  );
}
