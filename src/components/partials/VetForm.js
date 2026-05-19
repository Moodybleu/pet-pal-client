import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/petsApi';

const emptyForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  visit_type: '',
  pet_weight: '',
  shots: '',
  meds: '',
  other: '',
  tx_plan: '',
});

export default function VetForm({
  petId: petIdProp,
  compact = false,
  showBackLink = true,
  onSuccess,
  hidePetPicker = false,
  pets: petsProp,
}) {
  const { petId: petIdParam } = useParams();
  const routePetId = petIdParam;
  const showPetPicker = !routePetId && !hidePetPicker;

  const [pets, setPets] = useState(petsProp || []);
  const [selectedPetId, setSelectedPetId] = useState(routePetId || petIdProp || '');
  const [form, setForm] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingPets, setLoadingPets] = useState(showPetPicker);

  const navigate = useNavigate();
  const activePetId = routePetId || (hidePetPicker ? petIdProp : '') || selectedPetId;
  const petList = petsProp?.length ? petsProp : pets;

  useEffect(() => {
    if (petsProp?.length) {
      setPets(petsProp);
    }
  }, [petsProp]);

  useEffect(() => {
    if (routePetId) {
      setSelectedPetId(routePetId);
      return;
    }
    if (hidePetPicker) {
      setSelectedPetId(petIdProp || '');
      return;
    }

    const loadPets = async () => {
      setLoadingPets(true);
      try {
        const response = await api.get('/api/pet/');
        const list = response.data || [];
        setPets(list);
        if (list.length === 1) {
          setSelectedPetId(String(list[0].id));
        }
      } catch (err) {
        console.warn(err);
        setErrorMessage('Could not load your pets.');
      } finally {
        setLoadingPets(false);
      }
    };

    loadPets();
  }, [routePetId, hidePetPicker, petIdProp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!activePetId) {
      setErrorMessage(
        hidePetPicker ? 'Select a pet above to log a vet visit.' : 'Please select a pet.'
      );
      return;
    }

    try {
      await api.post('/api/health/', {
        pet: Number(activePetId),
        ...form,
      });

      if (onSuccess) {
        onSuccess(activePetId);
      } else if (routePetId) {
        navigate(`/pet/${activePetId}/diary/`);
        return;
      } else {
        const petName = petList.find((p) => String(p.id) === String(activePetId))?.name || 'your pet';
        setSuccessMessage(`Vet visit saved for ${petName}!`);
        setForm(emptyForm());
      }
    } catch (err) {
      console.warn(err);
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'object') {
          setErrorMessage(Object.values(data).flat().join(' '));
        } else {
          setErrorMessage(String(data));
        }
      } else {
        setErrorMessage('Could not save vet visit. Is the server running?');
      }
    }
  };

  if (!routePetId && !hidePetPicker && !loadingPets && pets.length === 0) {
    return (
      <div className={compact ? 'vet-form-compact' : 'vet-form-page'}>
        <p>Add a pet before logging vet visits.</p>
        <Link to="/pet/new/">Add your pet</Link>
      </div>
    );
  }

  return (
    <div className={compact ? 'vet-form-compact' : 'vet-form-page'}>
      {showBackLink && routePetId && (
        <p>
          <Link to={`/pet/${routePetId}/diary/`}>← Back to diary</Link>
        </p>
      )}

      {!compact && <h2>What did they do at the vet today?</h2>}
      {compact && <h2 className="vet-form-compact-title">Log a vet visit</h2>}

      {errorMessage && <p className="diary-error">{errorMessage}</p>}
      {successMessage && <p className="vet-form-success">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="vet-form-fields">
        {showPetPicker && (
          <div className="vet-form-field">
            <label htmlFor="pet-select">Pet:</label>
            {loadingPets ? (
              <p>Loading pets…</p>
            ) : (
              <select
                id="pet-select"
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                required
              >
                <option value="">Select a pet</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="vet-form-field">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>
        <div className="vet-form-field">
          <label htmlFor="visit_type">Visit type:</label>
          <input
            type="text"
            id="visit_type"
            value={form.visit_type}
            placeholder="Checkup, emergency, etc."
            onChange={(e) => setForm({ ...form, visit_type: e.target.value })}
          />
        </div>
        <div className="vet-form-field">
          <label htmlFor="pet_weight">Weight:</label>
          <input
            type="text"
            id="pet_weight"
            value={form.pet_weight}
            placeholder="Pet's weight"
            onChange={(e) => setForm({ ...form, pet_weight: e.target.value })}
          />
        </div>
        <div className="vet-form-field">
          <label htmlFor="shots">Shots:</label>
          <input
            type="text"
            id="shots"
            value={form.shots}
            placeholder="Any shots given?"
            onChange={(e) => setForm({ ...form, shots: e.target.value })}
          />
        </div>
        {!compact && (
          <>
            <div className="vet-form-field">
              <label htmlFor="meds">Medicines:</label>
              <input
                type="text"
                id="meds"
                value={form.meds}
                placeholder="Prescribed medication"
                onChange={(e) => setForm({ ...form, meds: e.target.value })}
              />
            </div>
            <div className="vet-form-field">
              <label htmlFor="other">Other:</label>
              <input
                type="text"
                id="other"
                value={form.other}
                placeholder="Additional notes"
                onChange={(e) => setForm({ ...form, other: e.target.value })}
              />
            </div>
            <div className="vet-form-field">
              <label htmlFor="tx_plan">Treatment plan:</label>
              <input
                type="text"
                id="tx_plan"
                value={form.tx_plan}
                placeholder="Treatment plan"
                onChange={(e) => setForm({ ...form, tx_plan: e.target.value })}
              />
            </div>
          </>
        )}

        <button type="submit" className="vet-form-submit">
          {compact ? 'Save visit' : 'Add your visit'}
        </button>
      </form>

      {compact && (
        <p className="vet-form-more-fields">
          <Link to={activePetId ? `/pet/${activePetId}/vet/` : '/user/profile/'}>
            More fields (meds, notes, treatment plan)
          </Link>
        </p>
      )}
    </div>
  );
}
