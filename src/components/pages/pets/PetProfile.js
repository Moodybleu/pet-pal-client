import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { buildPetFormData, getPetPhotoSrc } from '../../../utils/petForm';
import PetPhotoCropper from './PetPhotoCropper';
import './PetProfile.css';

const emptyForm = () => ({
  name: '',
  breed: '',
  age: '',
  nickname: '',
  catchphrase: '',
});

export default function PetProfile({ isCreate: isCreateProp = false }) {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);
  const [cropSourceUrl, setCropSourceUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const isNew = isCreateProp || !petId || petId === 'new';

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }

    const loadPet = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const response = await axios.get(`/api/pet/${petId}/`);
        const pet = response.data;
        setForm({
          name: pet.name || '',
          breed: pet.breed || '',
          age: pet.age || '',
          nickname: pet.nickname || '',
          catchphrase: pet.catchphrase || '',
        });
        setExistingPhotoUrl(getPetPhotoSrc(pet));
      } catch (err) {
        console.warn(err);
        setErrorMessage('Could not load this pet profile.');
      } finally {
        setLoading(false);
      }
    };

    loadPet();
  }, [petId, isNew]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  useEffect(() => {
    return () => {
      if (cropSourceUrl) {
        URL.revokeObjectURL(cropSourceUrl);
      }
    };
  }, [cropSourceUrl]);

  const openCropperWithFile = (file) => {
    if (cropSourceUrl) {
      URL.revokeObjectURL(cropSourceUrl);
    }
    setCropSourceUrl(URL.createObjectURL(file));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose an image file.');
      return;
    }
    setErrorMessage('');
    openCropperWithFile(file);
  };

  const handleAdjustPhoto = () => {
    const source = photoPreview || existingPhotoUrl;
    if (!source) return;
    setCropSourceUrl(source);
  };

  const handleCropCancel = () => {
    if (cropSourceUrl && cropSourceUrl.startsWith('blob:')) {
      URL.revokeObjectURL(cropSourceUrl);
    }
    setCropSourceUrl(null);
  };

  const handleCropComplete = (file) => {
    if (cropSourceUrl && cropSourceUrl.startsWith('blob:')) {
      URL.revokeObjectURL(cropSourceUrl);
    }
    setCropSourceUrl(null);
    setPhotoFile(file);
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    const payload = buildPetFormData(form, photoFile);

    try {
      if (isNew) {
        const response = await axios.post('/api/pet/', payload);
        navigate(`/pet/${response.data.id}/profile/`);
        return;
      }
      await axios.patch(`/api/pet/${petId}/`, payload);
      const response = await axios.get(`/api/pet/${petId}/`);
      setExistingPhotoUrl(getPetPhotoSrc(response.data));
      setPhotoFile(null);
      setPhotoPreview(null);
      setSuccessMessage('Profile saved!');
    } catch (err) {
      console.warn(err);
      if (err.response?.data && typeof err.response.data === 'object') {
        setErrorMessage(Object.values(err.response.data).flat().join(' '));
      } else {
        setErrorMessage('Could not save pet profile.');
      }
    } finally {
      setSaving(false);
    }
  };

  const displayPhoto = photoPreview || existingPhotoUrl;

  if (loading) {
    return (
      <div className="pet-profile-page">
        <p className="pet-profile-status">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="pet-profile-page">
      <p className="pet-profile-back">
        <Link to="/user/profile/">← Back to your pets</Link>
      </p>

      <h1>{isNew ? 'Create a pet profile' : `${form.name || 'Pet'}'s profile`}</h1>

      {errorMessage && (
        <p className="diary-error pet-profile-message" role="alert">
          {errorMessage}
        </p>
      )}
      {successMessage && <p className="vet-form-success pet-profile-message">{successMessage}</p>}

      <form className="pet-profile-form" onSubmit={handleSubmit}>
        <div className="pet-profile-photo-section">
          {cropSourceUrl ? (
            <PetPhotoCropper
              imageSrc={cropSourceUrl}
              onCancel={handleCropCancel}
              onComplete={handleCropComplete}
            />
          ) : (
            <>
              <div className="pet-profile-photo-frame">
                {displayPhoto ? (
                  <img src={displayPhoto} alt={form.name ? `${form.name}'s photo` : 'Pet'} />
                ) : (
                  <span className="pet-profile-photo-placeholder">Add a photo</span>
                )}
              </div>
              <div className="pet-profile-photo-actions">
                <label className="pet-profile-photo-upload">
                  <span>{displayPhoto ? 'Change photo' : 'Upload photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    aria-label="Pet photo"
                  />
                </label>
                {displayPhoto && (
                  <button type="button" className="pet-profile-adjust-photo" onClick={handleAdjustPhoto}>
                    Adjust framing
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {!cropSourceUrl && (
          <>
            <div className="pet-profile-fields">
              <div className="pet-profile-field">
                <label htmlFor="pet-name">Name</label>
                <input
                  id="pet-name"
                  type="text"
                  value={form.name}
                  placeholder="Pet's name"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="pet-profile-field">
                <label htmlFor="pet-breed">Breed</label>
                <input
                  id="pet-breed"
                  type="text"
                  value={form.breed}
                  placeholder="Breed"
                  onChange={(e) => setForm({ ...form, breed: e.target.value })}
                  required
                />
              </div>
              <div className="pet-profile-field">
                <label htmlFor="pet-age">Date of birth / adoption</label>
                <input
                  id="pet-age"
                  type="text"
                  value={form.age}
                  placeholder="When were they born or adopted?"
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
              </div>
              <div className="pet-profile-field">
                <label htmlFor="pet-nickname">Nickname</label>
                <input
                  id="pet-nickname"
                  type="text"
                  value={form.nickname}
                  placeholder="Nickname"
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                />
              </div>
              <div className="pet-profile-field">
                <label htmlFor="pet-catchphrase">Catchphrase</label>
                <input
                  id="pet-catchphrase"
                  type="text"
                  value={form.catchphrase}
                  placeholder="Their catchphrase"
                  onChange={(e) => setForm({ ...form, catchphrase: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="pet-profile-save" disabled={saving}>
              {saving ? 'Saving…' : isNew ? 'Create profile' : 'Save profile'}
            </button>
          </>
        )}
      </form>

      {!isNew && petId && !cropSourceUrl && (
        <p className="pet-profile-links">
          <Link to={`/pet/${petId}/diary/`}>View {form.name}&apos;s diary</Link>
        </p>
      )}
    </div>
  );
}
