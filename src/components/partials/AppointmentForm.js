import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const APPOINTMENT_TYPES = ['Groomer', 'Play date', 'Cuddles', 'Vet follow-up', 'Other'];

const emptyGroomer = () => ({ business_name: '', address: '', phone: '', notes: '' });
const emptyPlayDate = () => ({ place: '', day: '', phone: '', notes: '' });
const emptyCuddles = () => ({ notes: '' });
const emptyGeneric = () => ({ location: '', phone: '', notes: '' });
const emptyOther = () => ({ customTitle: '', location: '', phone: '', notes: '' });

function buildDescription(fields, type) {
  const parts = [];
  if (type === 'Groomer') {
    if (fields.business_name) parts.push(`Business: ${fields.business_name}`);
    if (fields.address) parts.push(`Address: ${fields.address}`);
    if (fields.phone) parts.push(`Phone: ${fields.phone}`);
  }
  if (type === 'Play date') {
    if (fields.place) parts.push(`Location: ${fields.place}`);
    if (fields.day) parts.push(`Day: ${fields.day}`);
    if (fields.phone) parts.push(`Phone: ${fields.phone}`);
  }
  if (fields.location) parts.push(`Location: ${fields.location}`);
  if (fields.phone) parts.push(`Phone: ${fields.phone}`);
  if (fields.notes) parts.push(`Notes: ${fields.notes}`);
  return parts.join('\n');
}

function AppointmentTypePanel({ title, petId, date, children, onSubmit, saving }) {
  return (
    <details className="appointment-type-panel">
      <summary>{title}</summary>
      <form
        className="appointment-type-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        {children}
        <button type="submit" className="vet-form-submit" disabled={saving || !petId}>
          Save {title}
        </button>
      </form>
    </details>
  );
}

function CompactAppointmentForm({ showBackLink, fixedPetId, hidePetPicker = false, pets: petsProp }) {
  const [pets, setPets] = useState(petsProp || []);
  const [selectedPetId, setSelectedPetId] = useState(fixedPetId || '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [groomer, setGroomer] = useState(emptyGroomer);
  const [playDate, setPlayDate] = useState(emptyPlayDate);
  const [cuddles, setCuddles] = useState(emptyCuddles);
  const [vetFollowUp, setVetFollowUp] = useState(emptyGeneric);
  const [otherAppt, setOtherAppt] = useState(emptyOther);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingPets, setLoadingPets] = useState(!hidePetPicker && !fixedPetId);
  const [saving, setSaving] = useState(false);

  const showPetPicker = !hidePetPicker && !fixedPetId;
  const activePetId = hidePetPicker ? fixedPetId : fixedPetId || selectedPetId;
  const petList = petsProp?.length ? petsProp : pets;

  useEffect(() => {
    if (petsProp?.length) {
      setPets(petsProp);
    }
  }, [petsProp]);

  useEffect(() => {
    if (hidePetPicker) {
      setSelectedPetId(fixedPetId || '');
      return;
    }
    if (fixedPetId) {
      setSelectedPetId(fixedPetId);
      return;
    }
    const loadPets = async () => {
      setLoadingPets(true);
      try {
        const response = await axios.get('/api/pet/');
        const list = response.data || [];
        setPets(list);
        if (list.length === 1) setSelectedPetId(String(list[0].id));
      } catch (err) {
        setErrorMessage('Could not load your pets.');
      } finally {
        setLoadingPets(false);
      }
    };
    loadPets();
  }, [fixedPetId, hidePetPicker]);

  const saveAppointment = async (title, fields) => {
    if (!activePetId) {
      setErrorMessage(
        hidePetPicker ? 'Select a pet above to schedule an appointment.' : 'Please select a pet.'
      );
      return;
    }
    if (title === 'Other' && !fields.customTitle?.trim()) {
      setErrorMessage('Please enter an appointment name for Other.');
      return;
    }
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const resolvedTitle = title === 'Other' ? fields.customTitle.trim() : title;
      await axios.post('/api/appointments/', {
        pet: Number(activePetId),
        date,
        title: resolvedTitle,
        description: buildDescription(fields, title),
      });
      const petName = petList.find((p) => String(p.id) === String(activePetId))?.name || 'your pet';
      const savedLabel = title === 'Other' ? fields.customTitle.trim() : title;
      setSuccessMessage(`${savedLabel} saved for ${petName}!`);
      if (title === 'Groomer') setGroomer(emptyGroomer());
      if (title === 'Play date') setPlayDate(emptyPlayDate());
      if (title === 'Cuddles') setCuddles(emptyCuddles());
      if (title === 'Vet follow-up') setVetFollowUp(emptyGeneric());
      if (title === 'Other') setOtherAppt(emptyOther());
    } catch (err) {
      console.warn(err);
      setErrorMessage('Could not save appointment.');
    } finally {
      setSaving(false);
    }
  };

  if (!hidePetPicker && !fixedPetId && !loadingPets && pets.length === 0) {
    return (
      <div className="vet-form-compact">
        <p>Add a pet before scheduling appointments.</p>
        <Link to="/pet/new/">Add your pet</Link>
      </div>
    );
  }

  return (
    <div className="vet-form-compact">
      <h2 className="vet-form-compact-title">Log an appointment</h2>
      {errorMessage && <p className="diary-error">{errorMessage}</p>}
      {successMessage && <p className="vet-form-success">{successMessage}</p>}

      <div className="vet-form-fields">
        {showPetPicker && (
          <div className="vet-form-field">
            <label htmlFor="appt-pet-select">Pet:</label>
            {loadingPets ? (
              <p>Loading pets…</p>
            ) : (
              <select
                id="appt-pet-select"
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
          <label htmlFor="appt-shared-date">Date:</label>
          <input
            type="date"
            id="appt-shared-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <AppointmentTypePanel
        title="Groomer"
        petId={activePetId}
        date={date}
        saving={saving}
        onSubmit={() => saveAppointment('Groomer', groomer)}
      >
        <div className="vet-form-field">
          <label htmlFor="groomer-business">Business name:</label>
          <input
            id="groomer-business"
            type="text"
            placeholder="Groomer name"
            value={groomer.business_name}
            onChange={(e) => setGroomer({ ...groomer, business_name: e.target.value })}
          />
        </div>
        <div className="vet-form-field">
          <label htmlFor="groomer-address">Address:</label>
          <input
            id="groomer-address"
            type="text"
            placeholder="Address"
            value={groomer.address}
            onChange={(e) => setGroomer({ ...groomer, address: e.target.value })}
          />
        </div>
        <div className="vet-form-field">
          <label htmlFor="groomer-phone">Phone:</label>
          <input
            id="groomer-phone"
            type="text"
            placeholder="Phone number"
            value={groomer.phone}
            onChange={(e) => setGroomer({ ...groomer, phone: e.target.value })}
          />
        </div>
        <div className="vet-form-field">
          <label htmlFor="groomer-notes">Notes:</label>
          <input
            id="groomer-notes"
            type="text"
            placeholder="Optional notes"
            value={groomer.notes}
            onChange={(e) => setGroomer({ ...groomer, notes: e.target.value })}
          />
        </div>
      </AppointmentTypePanel>

      <AppointmentTypePanel
        title="Play date"
        petId={activePetId}
        date={date}
        saving={saving}
        onSubmit={() => saveAppointment('Play date', playDate)}
      >
        <div className="vet-form-field">
          <label htmlFor="play-place">Location:</label>
          <input
            id="play-place"
            type="text"
            placeholder="Where is the play date?"
            value={playDate.place}
            onChange={(e) => setPlayDate({ ...playDate, place: e.target.value })}
          />
        </div>
        <div className="vet-form-field">
          <label htmlFor="play-day">Day:</label>
          <input
            id="play-day"
            type="text"
            placeholder="Day of the week"
            value={playDate.day}
            onChange={(e) => setPlayDate({ ...playDate, day: e.target.value })}
          />
        </div>
        <div className="vet-form-field">
          <label htmlFor="play-phone">Phone:</label>
          <input
            id="play-phone"
            type="text"
            placeholder="Contact phone"
            value={playDate.phone}
            onChange={(e) => setPlayDate({ ...playDate, phone: e.target.value })}
          />
        </div>
        <div className="vet-form-field">
          <label htmlFor="play-notes">Notes:</label>
          <input
            id="play-notes"
            type="text"
            placeholder="Optional notes"
            value={playDate.notes}
            onChange={(e) => setPlayDate({ ...playDate, notes: e.target.value })}
          />
        </div>
      </AppointmentTypePanel>

      <AppointmentTypePanel
        title="Cuddles"
        petId={activePetId}
        date={date}
        saving={saving}
        onSubmit={() => saveAppointment('Cuddles', cuddles)}
      >
        <div className="vet-form-field">
          <label htmlFor="cuddles-notes">Notes:</label>
          <input
            id="cuddles-notes"
            type="text"
            placeholder="Cuddle session details"
            value={cuddles.notes}
            onChange={(e) => setCuddles({ ...cuddles, notes: e.target.value })}
          />
        </div>
      </AppointmentTypePanel>

      <AppointmentTypePanel
        title="Vet follow-up"
        petId={activePetId}
        date={date}
        saving={saving}
        onSubmit={() => saveAppointment('Vet follow-up', vetFollowUp)}
      >
        <div className="vet-form-field">
          <label htmlFor="vet-followup-location">Location:</label>
          <input
            id="vet-followup-location"
            type="text"
            placeholder="Clinic or location"
            value={vetFollowUp.location}
            onChange={(e) => setVetFollowUp({ ...vetFollowUp, location: e.target.value })}
          />
        </div>
        <div className="vet-form-field">
          <label htmlFor="vet-followup-phone">Phone:</label>
          <input
            id="vet-followup-phone"
            type="text"
            placeholder="Contact phone"
            value={vetFollowUp.phone}
            onChange={(e) => setVetFollowUp({ ...vetFollowUp, phone: e.target.value })}
          />
        </div>
        <div className="vet-form-field">
          <label htmlFor="vet-followup-notes">Notes:</label>
          <input
            id="vet-followup-notes"
            type="text"
            placeholder="Follow-up details"
            value={vetFollowUp.notes}
            onChange={(e) => setVetFollowUp({ ...vetFollowUp, notes: e.target.value })}
          />
        </div>
      </AppointmentTypePanel>

      <AppointmentTypePanel
        title="Other"
        petId={activePetId}
        date={date}
        saving={saving}
        onSubmit={() => saveAppointment('Other', otherAppt)}
      >
        <div className="vet-form-field">
          <label htmlFor="other-title">Appointment name:</label>
          <input
            id="other-title"
            type="text"
            placeholder="e.g. Training class"
            value={otherAppt.customTitle}
            onChange={(e) => setOtherAppt({ ...otherAppt, customTitle: e.target.value })}
          />
        </div>
        <div className="vet-form-field">
          <label htmlFor="other-location">Location:</label>
          <input
            id="other-location"
            type="text"
            placeholder="Location"
            value={otherAppt.location}
            onChange={(e) => setOtherAppt({ ...otherAppt, location: e.target.value })}
          />
        </div>
        <div className="vet-form-field">
          <label htmlFor="other-phone">Phone:</label>
          <input
            id="other-phone"
            type="text"
            placeholder="Phone"
            value={otherAppt.phone}
            onChange={(e) => setOtherAppt({ ...otherAppt, phone: e.target.value })}
          />
        </div>
        <div className="vet-form-field">
          <label htmlFor="other-notes">Notes:</label>
          <input
            id="other-notes"
            type="text"
            placeholder="Notes"
            value={otherAppt.notes}
            onChange={(e) => setOtherAppt({ ...otherAppt, notes: e.target.value })}
          />
        </div>
      </AppointmentTypePanel>

      {activePetId && (
        <p className="vet-form-more-fields">
          <Link to={`/pet/${activePetId}/appointment/`}>More fields on full appointment page</Link>
        </p>
      )}
    </div>
  );
}

// Full-page form (unchanged structure)
const emptyForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  title: 'Groomer',
  customTitle: '',
  location: '',
  phone: '',
  notes: '',
});

function FullAppointmentForm({
  petIdProp,
  showBackLink = true,
  onSuccess,
}) {
  const { petId: petIdParam } = useParams();
  const fixedPetId = petIdProp || petIdParam;

  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(fixedPetId || '');
  const [form, setForm] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingPets, setLoadingPets] = useState(!fixedPetId);
  const navigate = useNavigate();
  const activePetId = fixedPetId || selectedPetId;
  const resolvedTitle = form.title === 'Other' ? form.customTitle.trim() : form.title;

  useEffect(() => {
    if (fixedPetId) {
      setSelectedPetId(fixedPetId);
      return;
    }
    const loadPets = async () => {
      setLoadingPets(true);
      try {
        const response = await axios.get('/api/pet/');
        const list = response.data || [];
        setPets(list);
        if (list.length === 1) setSelectedPetId(String(list[0].id));
      } catch (err) {
        setErrorMessage('Could not load your pets.');
      } finally {
        setLoadingPets(false);
      }
    };
    loadPets();
  }, [fixedPetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (!activePetId) {
      setErrorMessage('Please select a pet.');
      return;
    }
    if (!resolvedTitle) {
      setErrorMessage('Please enter an appointment type.');
      return;
    }
    const description = [
      form.location && `Location: ${form.location}`,
      form.phone && `Phone: ${form.phone}`,
      form.notes && `Notes: ${form.notes}`,
    ]
      .filter(Boolean)
      .join('\n');
    try {
      await axios.post('/api/appointments/', {
        pet: Number(activePetId),
        date: form.date,
        title: resolvedTitle,
        description,
      });
      if (onSuccess) {
        onSuccess(activePetId);
      } else if (fixedPetId) {
        navigate(`/pet/${activePetId}/diary/`);
      } else {
        setSuccessMessage('Appointment saved!');
        setForm(emptyForm());
      }
    } catch (err) {
      setErrorMessage('Could not save appointment.');
    }
  };

  return (
    <div className="vet-form-page">
      {showBackLink && fixedPetId && (
        <p>
          <Link to={`/pet/${fixedPetId}/diary/`}>← Back to diary</Link>
        </p>
      )}
      <h2>Schedule an appointment</h2>
      {errorMessage && <p className="diary-error">{errorMessage}</p>}
      {successMessage && <p className="vet-form-success">{successMessage}</p>}
      <form onSubmit={handleSubmit} className="vet-form-fields">
        {!fixedPetId && (
          <div className="vet-form-field">
            <label htmlFor="appt-pet-select-full">Pet:</label>
            <select
              id="appt-pet-select-full"
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
          </div>
        )}
        <div className="vet-form-field">
          <label htmlFor="appt-date-full">Date:</label>
          <input
            type="date"
            id="appt-date-full"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>
        <div className="vet-form-field">
          <label htmlFor="appt-title-full">Type:</label>
          <select
            id="appt-title-full"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          >
            {APPOINTMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        {form.title === 'Other' && (
          <div className="vet-form-field">
            <label htmlFor="appt-custom-title-full">Appointment name:</label>
            <input
              type="text"
              id="appt-custom-title-full"
              value={form.customTitle}
              onChange={(e) => setForm({ ...form, customTitle: e.target.value })}
              required
            />
          </div>
        )}
        <div className="vet-form-field">
          <label htmlFor="appt-location-full">Location:</label>
          <input
            type="text"
            id="appt-location-full"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        <div className="vet-form-field">
          <label htmlFor="appt-phone-full">Phone:</label>
          <input
            type="text"
            id="appt-phone-full"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div className="vet-form-field">
          <label htmlFor="appt-notes-full">Notes:</label>
          <input
            type="text"
            id="appt-notes-full"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <button type="submit" className="vet-form-submit">
          Add appointment
        </button>
      </form>
    </div>
  );
}

export default function AppointmentForm({
  petId: petIdProp,
  compact = false,
  showBackLink = true,
  onSuccess,
  hidePetPicker = false,
  pets: petsProp,
}) {
  const { petId: petIdParam } = useParams();
  const routePetId = petIdParam;
  const sharedPetId = hidePetPicker ? petIdProp : petIdProp || routePetId;

  if (compact) {
    return (
      <CompactAppointmentForm
        showBackLink={showBackLink}
        fixedPetId={sharedPetId}
        hidePetPicker={hidePetPicker}
        pets={petsProp}
      />
    );
  }

  return (
    <FullAppointmentForm
      petIdProp={sharedPetId || routePetId}
      showBackLink={showBackLink}
      onSuccess={onSuccess}
    />
  );
}
