import { useState } from 'react';
import axios from 'axios';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

export default function UserNew({ currentUser, setCurrentUser }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    try {
      const response = await axios.post('http://localhost:8000/api/user/', {
        username,
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem('jwt', token);
      setCurrentUser(jwt_decode(token));
      navigate('/user/profile/');
    } catch (err) {
      console.warn(err);
      if (err.response?.status === 400) {
        const data = err.response.data;
        if (data.msg) {
          setMsg(data.msg);
        } else if (typeof data === 'object') {
          setMsg(Object.values(data).flat().join(' '));
        } else {
          setMsg('Sign up failed. Check your details and try again.');
        }
      } else {
        setMsg('Could not reach the server. Is Django running on port 8000?');
      }
    }
  };

  if (currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <h1>Sign up to add your pet!</h1>
      {msg && <p>{msg}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="username">
          <h2>username:</h2>
        </label>
        <input
          type="text"
          id="username"
          placeholder="Enter your username"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          required
        />
        <label htmlFor="email">
          <h2>Email:</h2>
        </label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
        />
        <label className="pass" htmlFor="password">
          <h2>Password:</h2>
        </label>
        <input
          type="password"
          id="password"
          placeholder="Choose your password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
        />
        <button type="submit" className="bg-sky-500 hover:bg-sky-700 ...">
          <h2>Register</h2>
        </button>
      </form>

      <div>
        <p>
          Already a member?
          <Link to="/user/login">
            <u>Login here</u>
          </Link>
        </p>
      </div>
    </div>
  );
}
