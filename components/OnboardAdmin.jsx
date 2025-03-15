import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onboardAdminAPI } from '../api/api';

const OnboardAdmin = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleOnboardAdmin = async (e) => {
    e.preventDefault();
    try {
      await onboardAdminAPI({ name, email, contactNumber });
      setMessage('Admin onboarded successfully');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Onboard Admin failed');
    }
  };

  return (
    <div className="page-container">
      <form onSubmit={handleOnboardAdmin} className="form-container">
        <h2 className="center-text">Onboard Library Admin</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="text"
          placeholder="Contact Number"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          className="input-field"
        />
        {error && <p className="center-text" style={{ color: 'red' }}>{error}</p>}
        {message && <p className="center-text" style={{ color: 'green' }}>{message}</p>}
        <button type="submit" className="button-primary">
          Onboard Admin
        </button>
      </form>
      <button onClick={() => navigate('/')} className="fixed-button">
        Return to Home Page
      </button>
    </div>
  );
};

export default OnboardAdmin;
