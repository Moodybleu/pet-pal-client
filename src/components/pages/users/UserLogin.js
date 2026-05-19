import { useState } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { useNavigate, Navigate } from 'react-router-dom';

export default function UserLogin({ currentUser, setCurrentUser }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    try {
      const response = await axios.post('/api/user/login/', {
        login,
        password,
      });

      const { token } = response.data;
      localStorage.setItem('jwt', token);
      setCurrentUser(jwt_decode(token));
      navigate('/user/profile/');
    } catch (err) {
      console.warn(err);
      if (err.response?.status === 400) {
        setMsg(err.response.data.msg || 'Login failed. Check your username or email and password.');
      } else {
        setMsg('Could not reach the server. Is Django running on port 8000?');
      }
    }
  };

  if (currentUser) {
    return <Navigate to="/user/profile/" />;
  }

  return (
    <div className="auth-page">
      <h1>Login to access your account</h1>
      {msg && <p>{msg}</p>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="login">
            <h2>Username or email:</h2>
          </label>
          <input
            type="text"
            id="login"
            className="auth-input"
            placeholder="your username or email"
            onChange={(e) => setLogin(e.target.value)}
            value={login}
            required
            autoComplete="username"
          />
        </div>
        <div className="auth-field">
          <label htmlFor="password">
            <h2>Password:</h2>
          </label>
          <input
            type="password"
            id="password"
            className="auth-input"
            placeholder="enter your password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="bg-sky-500 hover:bg-sky-700 ...">
          <h2>Login</h2>
        </button>
      </form>
    </div>
  );
}
