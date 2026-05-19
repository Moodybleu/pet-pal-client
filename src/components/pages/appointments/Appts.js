import { Link } from 'react-router-dom';
import AppointmentForm from '../../partials/AppointmentForm';

export default function Appts({ isLoggedIn: isLoggedInProp, selectedPetId, pets, hidePetPicker }) {
  const isLoggedIn = isLoggedInProp || Boolean(localStorage.getItem('jwt'));

  if (!isLoggedIn) {
    return (
      <div>
        <h1 className="text-2xl">Appointments</h1>
        <p>
          <Link to="/user/login/">Log in</Link> to schedule appointments for your pets.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl">Appointments</h1>
      <AppointmentForm
        compact
        showBackLink={false}
        petId={selectedPetId}
        hidePetPicker={hidePetPicker}
        pets={pets}
      />
    </div>
  );
}
