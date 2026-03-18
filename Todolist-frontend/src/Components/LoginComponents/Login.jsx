import React, { useState } from 'react';
import Register from './Register';
import './Login.css';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [showRegister, setShowRegister] = useState(false);
  const [credentials, setCredentials] = useState({ userName: '', password: '' });

  const isLoginDisabled =
    status === 'loading' ||
    !credentials.userName?.trim() ||
    !credentials.password?.trim();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(login(credentials));
    if (login.fulfilled.match(resultAction)) {
      navigate('/dashboard', { replace: true });
    }
  }

  const handleRegister = () => {
    dispatch(clearAuthError());
    setShowRegister(true);
  };

  return (
    <div className="lc-root">
      {!showRegister ? (
        <div className="lc-card">
          <h2 className="lc-title">Login</h2>
          <form onSubmit={handleLogin}>
            <div className="lc-field">
              <label htmlFor="login-username">Username</label>
              <input id="login-username" name="userName" className="lc-input" value={credentials.userName} onChange={handleChange} />
            </div>
            <div className="lc-field">
              <label htmlFor="login-password">Password</label>
              <input id="login-password" name="password" type="password" className="lc-input" value={credentials.password} onChange={handleChange} />
            </div>
            <div className="lc-actions">
              <button type="submit" className="btn primary" disabled={isLoginDisabled}>
                {status === 'loading' ? 'Logging in…' : 'Login'}
              </button>
              <button type="button" className="btn secondary" onClick={handleRegister}>Register</button>
            </div>
            {error ? <p className='error-message'>{error}</p> : null}
          </form>
        </div>
      ) : (
        <div className="lc-card">
          <Register onClose={() => setShowRegister(false)} />
        </div>
      )}
    </div>
  );
}

export default Login;