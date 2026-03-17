import React, { useState } from 'react';
import { apiClient } from '../../api/client';

const Register = ({ onClose }) => {
  const [form, setForm] = useState({ userName: '', password: ''});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isRegisterDisabled =
    submitting ||
    !form.userName?.trim() ||
    !form.password?.trim();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      await apiClient.post('/user/register', form);
      if (onClose) onClose();
    } catch (error) {
      console.error('Registration error:', error);
      const responseData = error?.response?.data;
      const backendMessage = typeof responseData === 'string'
        ? responseData
        : responseData?.message;
      setError(backendMessage || error?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="register-body">
      <h2 className="lc-title">Register</h2>
      <form onSubmit={handleRegister}>
        <div className="lc-field">
          <label htmlFor="register-username">Username</label>
          <input id="register-username" name="userName" className="lc-input" value={form.userName} onChange={handleChange} />
        </div>
        <div className="lc-field">
          <label htmlFor="register-password">Password</label>
          <input id="register-password" name="password" type="password" className="lc-input" value={form.password} onChange={handleChange} />
        </div>
        <div className="lc-actions">
          <button type="submit" className="btn primary" disabled={isRegisterDisabled}>
            {submitting ? 'Registering…' : 'Register'}
          </button>
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
        </div>
        {error ? <p style={{ marginTop: 12, color: 'salmon' }}>{error}</p> : null}
      </form>
    </div>
  );
}

export default Register;