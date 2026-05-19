import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import api from '../../../utils/petsApi';
import jwt_decode from 'jwt-decode';

export default function UserLogin({ currentUser, setCurrentUser }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [showForgotHelp, setShowForgotHelp] = useState(false);
  const [forgotMode, setForgotMode] = useState('remind');
  const [reminderEmail, setReminderEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotSending, setForgotSending] = useState(false);
  const navigate = useNavigate();

  const closeForgotHelp = () => {
    setShowForgotHelp(false);
    setForgotMode('remind');
    setReminderEmail('');
    setResetEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    try {
      const response = await api.post('/api/user/login/', {
        login: login.trim(),
        password,
      });

      const { token } = response.data;
      localStorage.setItem('jwt', token);
      setCurrentUser(jwt_decode(token));
      navigate('/user/profile/');
    } catch (err) {
      console.warn(err);
      if (err.response?.status === 400) {
        setMsg(
          err.response.data.msg
            || 'Login failed. Use Reset password to set a new one, or Sign up if you have not created an account yet.'
        );
      } else {
        setMsg('Could not reach the server. Check that the API is running.');
      }
    }
  };

  const handleRemindLogin = async (e) => {
    e.preventDefault();
    setMsg('');
    setForgotSending(true);

    try {
      const response = await api.post('/api/user/remind-login/', {
        email: reminderEmail.trim(),
      });
      setMsg(response.data.msg);
      if (response.status === 200) {
        closeForgotHelp();
      }
    } catch (err) {
      console.warn(err);
      setMsg(err.response?.data?.msg || 'Could not send login reminder. Try again later.');
    } finally {
      setForgotSending(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMsg('');
    setForgotSending(true);

    try {
      const response = await api.post('/api/user/reset-password/', {
        email: resetEmail.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      const emailUsed = resetEmail.trim();
      setShowForgotHelp(false);
      setForgotMode('remind');
      setResetEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setLogin(emailUsed);
      setPassword('');
      setMsg(response.data.msg);
    } catch (err) {
      console.warn(err);
      setMsg(err.response?.data?.msg || 'Could not reset password. Try again later.');
    } finally {
      setForgotSending(false);
    }
  };

  if (currentUser) {
    return <Navigate to="/user/profile/" />;
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
      <h1>Login to access your account</h1>
      {msg && <p className="auth-message">{msg}</p>}

      {!showForgotHelp ? (
        <>
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

          <p className="auth-footer">
            <button
              type="button"
              className="auth-link-button"
              onClick={() => {
                setShowForgotHelp(true);
                setMsg('');
              }}
            >
              Trouble logging in?
            </button>
          </p>
          <p className="auth-footer">
            New here?{' '}
            <Link to="/user/new/">
              <u>Sign up</u>
            </Link>
          </p>
        </>
      ) : (
        <div className="auth-forgot-panel">
          <div className="auth-forgot-tabs" role="tablist" aria-label="Login help options">
            <button
              type="button"
              role="tab"
              aria-selected={forgotMode === 'remind'}
              className={`auth-forgot-tab${forgotMode === 'remind' ? ' auth-forgot-tab--active' : ''}`}
              onClick={() => {
                setForgotMode('remind');
                setMsg('');
              }}
            >
              Email login info
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={forgotMode === 'reset'}
              className={`auth-forgot-tab${forgotMode === 'reset' ? ' auth-forgot-tab--active' : ''}`}
              onClick={() => {
                setForgotMode('reset');
                setMsg('');
              }}
            >
              Reset password
            </button>
          </div>

          {forgotMode === 'remind' ? (
            <form className="auth-form" onSubmit={handleRemindLogin}>
              <p className="auth-forgot-intro">
                Enter your sign-up email. We will send your username and a temporary password.
                If email is not set up on the server, use the <strong>Reset password</strong> tab instead.
              </p>
              <div className="auth-field">
                <label htmlFor="reminder-email">
                  <h2>Your email:</h2>
                </label>
                <input
                  type="email"
                  id="reminder-email"
                  className="auth-input"
                  placeholder="you@example.com"
                  value={reminderEmail}
                  onChange={(e) => setReminderEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <button type="submit" className="bg-sky-500 hover:bg-sky-700 ..." disabled={forgotSending}>
                <h2>{forgotSending ? 'Sending…' : 'Email my login info'}</h2>
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleResetPassword}>
              <p className="auth-forgot-intro">
                Enter your sign-up email and choose a new password. If the email is not registered yet,
                use <strong>Sign up</strong> instead — reset only works for existing accounts.
              </p>
              <div className="auth-field">
                <label htmlFor="reset-email">
                  <h2>Your email:</h2>
                </label>
                <input
                  type="email"
                  id="reset-email"
                  className="auth-input"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="new-password">
                  <h2>New password:</h2>
                </label>
                <input
                  type="password"
                  id="new-password"
                  className="auth-input"
                  placeholder="at least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="confirm-password">
                  <h2>Confirm password:</h2>
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  className="auth-input"
                  placeholder="re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="bg-sky-500 hover:bg-sky-700 ..." disabled={forgotSending}>
                <h2>{forgotSending ? 'Resetting…' : 'Reset password'}</h2>
              </button>
            </form>
          )}

          <p className="auth-footer">
            <button type="button" className="auth-link-button" onClick={closeForgotHelp}>
              ← Back to login
            </button>
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
