import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
          <h1>Pocwisper</h1>
        </Link>
        {user && (
          <div>
            <span style={{ marginRight: '20px' }}>Bonjour, {user.username}</span>
            <button className="btn btn-secondary" onClick={logout}>
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
