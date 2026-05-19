import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useState } from 'react';
import jwt_decode from 'jwt-decode';

import UserNew from './components/pages/users/UserNew';
import UserLogin from './components/pages/users/UserLogin';
import Home from './components/pages/Home';
import Profile from './components/pages/users/Profile';
import PetProfile from './components/pages/pets/PetProfile';
import PetDiary from './components/pages/pets/PetDiary';
import VetForm from './components/partials/VetForm';
import AppointmentForm from './components/partials/AppointmentForm';
import NavBar from './components/partials/NavBar';

function getUserFromStorage() {
  const token = localStorage.getItem('jwt');
  if (!token) return null;
  try {
    return jwt_decode(token);
  } catch {
    localStorage.removeItem('jwt');
    return null;
  }
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(getUserFromStorage);

  return (
    <div className="App">
      <Router>
        <NavBar currentUser={currentUser} setCurrentUser={setCurrentUser} />
        <main className="app-main">
        <Routes>
          <Route path="/" element={<Home isLoggedIn={Boolean(currentUser)} />} />
          <Route path="/user/pet/" element={<PetProfile isCreate />} />
          <Route path="/pet/new/" element={<PetProfile isCreate />} />
          <Route path="/pet/new" element={<PetProfile isCreate />} />
          <Route path="/pet/:petId/profile" element={<PetProfile />} />
          <Route path="/pet/:petId/profile/" element={<PetProfile />} />
          <Route
            path="/user/new/"
            element={<UserNew currentUser={currentUser} setCurrentUser={setCurrentUser} />}
          />
          <Route
            path="/user/login/"
            element={<UserLogin currentUser={currentUser} setCurrentUser={setCurrentUser} />}
          />
          <Route path="/user/profile/" element={<Profile />} />
          <Route path="/pet/:petId/diary" element={<PetDiary />} />
          <Route path="/pet/:petId/diary/" element={<PetDiary />} />
          <Route path="/pet/:petId/vet" element={<VetForm />} />
          <Route path="/pet/:petId/vet/" element={<VetForm />} />
          <Route path="/pet/:petId/appointment" element={<AppointmentForm />} />
          <Route path="/pet/:petId/appointment/" element={<AppointmentForm />} />
        </Routes>
        </main>
      </Router>
    </div>
  );
}
