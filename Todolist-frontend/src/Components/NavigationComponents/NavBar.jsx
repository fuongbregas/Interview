import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, selectAuth } from '../../store/authSlice';
import './NavBar.css';

const NavBar = () => {
  const auth = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!auth) return null;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  return (
    <header className="nav-root">
      <div className="nav-spacer" />
      <div className="nav-actions">
        <button type="button" className="nav-btn" aria-label="Profile" onClick={handleProfile}>
          Profile
        </button>
        <button type="button" className="nav-btn primary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default NavBar;