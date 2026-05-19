import { Link } from 'react-router-dom';

export default function NavBar({ currentUser, setCurrentUser }) {
  const isLoggedIn = Boolean(currentUser);

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setCurrentUser(null);
  };

  return (
    <nav>
      <div>
        <Link to="/" className="hover:bg-white ...">
          Home
        </Link>
        {isLoggedIn && (
          <Link to="/pet/new/" className="hover:bg-white ...">
            Add your pet
          </Link>
        )}
        {isLoggedIn ? (
          <>
            <Link to="/user/profile/">Your Profile</Link>
            <button type="button" className="nav-logout" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/user/new/" className="hover:bg-white ...">
              Sign Up
            </Link>
            <Link to="/user/login/" className="hover:bg-white ...">
              Log into your Account
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
