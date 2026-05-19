import { useEffect, useState } from 'react';
import api from '../../utils/petsApi';
import SelectionCards from '../partials/SelectionCards';
import HomePetPicker from '../partials/HomePetPicker';
import Daily from './daily_needs/Daily';
import Appts from './appointments/Appts';
import { parsePetList } from '../../utils/petsApi';

const SELECTED_PET_KEY = 'petPalSelectedPetId';

export default function Home({ isLoggedIn: isLoggedInProp }) {
  const isLoggedIn = isLoggedInProp || Boolean(localStorage.getItem('jwt'));
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(
    () => sessionStorage.getItem(SELECTED_PET_KEY) || ''
  );
  const [loadingPets, setLoadingPets] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const loadPets = async () => {
      setLoadingPets(true);
      try {
        const response = await api.get('/api/pet/');
        const list = parsePetList(response.data);
        setPets(list);

        const stored = sessionStorage.getItem(SELECTED_PET_KEY);
        if (stored && list.some((p) => String(p.id) === stored)) {
          setSelectedPetId(stored);
        } else if (list.length === 1) {
          const onlyId = String(list[0].id);
          setSelectedPetId(onlyId);
          sessionStorage.setItem(SELECTED_PET_KEY, onlyId);
        } else {
          setSelectedPetId('');
          sessionStorage.removeItem(SELECTED_PET_KEY);
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setLoadingPets(false);
      }
    };

    loadPets();
  }, [isLoggedIn]);

  const handleSelectPet = (petId) => {
    setSelectedPetId(petId);
    if (petId) {
      sessionStorage.setItem(SELECTED_PET_KEY, petId);
    } else {
      sessionStorage.removeItem(SELECTED_PET_KEY);
    }
  };

  const sharedPetProps = {
    selectedPetId,
    pets,
    loadingPets,
    hidePetPicker: true,
  };

  return (
    <div className="pet_diary">
      <h1 className="text-3xl">Welcome to Pet Pal!</h1>
      <h3 className="text-1xl">
        {isLoggedIn ? 'Log care for your pets below.' : 'Add a pet to get started!'}
      </h3>

      {isLoggedIn && (
        <HomePetPicker
          pets={pets}
          selectedPetId={selectedPetId}
          onSelectPet={handleSelectPet}
          loadingPets={loadingPets}
        />
      )}

      <div className="row">
        <div className="selectioncard column">
          <SelectionCards isLoggedIn={isLoggedIn} {...sharedPetProps} />
        </div>
        <div className="selectioncard column">
          <Daily isLoggedIn={isLoggedIn} {...sharedPetProps} />
        </div>
        <div className="selectioncard column">
          <Appts isLoggedIn={isLoggedIn} {...sharedPetProps} />
        </div>
      </div>
    </div>
  );
}
