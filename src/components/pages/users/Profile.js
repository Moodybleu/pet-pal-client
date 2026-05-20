import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api, { formatApiError, parsePetList } from '../../../utils/petsApi';
import { getPetPhotoSrc } from '../../../utils/petForm';
import './Profile.css';

export default function Profile() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const getPets = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const response = await api.get('/api/pet/');
        setPets(parsePetList(response.data));
      } catch (err) {
        console.warn(err);
        setErrorMessage(formatApiError(err, 'Could not load pets.'));
      } finally {
        setLoading(false);
      }
    };
    getPets();
  }, []);

  return (
    <div className="welcome-page">
      <div className="welcome-page-content">
        <h1 className="welcome-title">Welcome to Pet Pal</h1>
        <p className="welcome-tagline">
          Pet Pal is designed to keep you up to date on your pets appointments and needs.
        </p>

        {errorMessage && (
          <p className="welcome-error" role="alert">
            {errorMessage}
          </p>
        )}

        <nav className="welcome-links" aria-label="Your pets">
          {loading && <p className="welcome-status">Loading your pets…</p>}
          {!loading &&
            pets.map((pet) => {
              const photoSrc = getPetPhotoSrc(pet);
              return (
                <div key={pet.id} className="welcome-pet-row">
                  <div className="welcome-pet-thumb-wrap">
                    {photoSrc ? (
                      <img src={photoSrc} alt="" className="welcome-pet-thumb" />
                    ) : (
                      <span className="welcome-pet-thumb welcome-pet-thumb--empty" aria-hidden>
                        🐾
                      </span>
                    )}
                  </div>
                  <div className="welcome-pet-links">
                    <Link to={`/pet/${pet.id}/profile/`}>{pet.name}&apos;s profile</Link>
                    <span className="welcome-pet-separator" aria-hidden="true">
                      |
                    </span>
                    <Link to={`/pet/${pet.id}/diary/`}>Diary</Link>
                  </div>
                </div>
              );
            })}
          {!loading && pets.length === 0 && !errorMessage && (
            <p className="welcome-status">No pets yet — add one below.</p>
          )}
          <Link to="/pet/new/" className="welcome-link-add">
            Add your pet
          </Link>
        </nav>

        <p className="welcome-home-link">
          <Link to="/">Go to homepage to log care</Link>
        </p>
      </div>
    </div>
  );
}

