import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function PetNew() {
  const [form, setForm] = useState({
    name: '',
    breed: '',
    age: '',
    nickname: '',
    catchphrase: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      await axios.post('http://localhost:8000/api/pet/', form);
      navigate('/user/profile/');
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
        setErrorMessage('Could not reach the server. Is Django running on port 8000?');
      }
    }
  };

  return (
    <div>
      <h2>Need to add a new pet?</h2>
      {errorMessage && <p>{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">
            <h2>Name:</h2>
          </label>
          <input
            type="text"
            id="name"
            value={form.name}
            placeholder="What's your pet's name?"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="breed">
            <h2>Breed:</h2>
          </label>
          <input
            type="text"
            id="breed"
            value={form.breed}
            placeholder="What breed is your pet?"
            onChange={(e) => setForm({ ...form, breed: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="age">
            <h2>Date of birth/adoption:</h2>
          </label>
          <input
            type="text"
            id="age"
            value={form.age}
            placeholder="When was your pet born or adopted?"
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="nickname">
            <h2>Nickname:</h2>
          </label>
          <input
            type="text"
            id="nickname"
            value={form.nickname}
            placeholder="Does your pet have a nickname?"
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="catchphrase">
            <h2>Catchphrase:</h2>
          </label>
          <input
            type="text"
            id="catchphrase"
            value={form.catchphrase}
            placeholder="Your pet's catchphrase"
            onChange={(e) => setForm({ ...form, catchphrase: e.target.value })}
          />
        </div>

        <button type="submit">
          <h3>Add your pet</h3>
        </button>
      </form>
    </div>
  );
}
