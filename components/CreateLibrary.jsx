import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLibraryAPI } from '../api/api';

const CreateLibrary = () => {
  const [libraryName, setLibraryName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleCreateLibrary = async (e) => {
    e.preventDefault();
    try {
      await createLibraryAPI({ libraryName, ownerName, ownerEmail, ownerContact });
      setMessage('Library created successfully');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Library creation failed');
    }
  };

  return (
    <div className="page-container">
      <form onSubmit={handleCreateLibrary} className="form-container">
        <input
          type="text"
          placeholder="Library Name"
          value={libraryName}
          onChange={(e) => setLibraryName(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="text"
          placeholder="Owner Name"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="email"
          placeholder="Owner Email"
          value={ownerEmail}
          onChange={(e) => setOwnerEmail(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="text"
          placeholder="Owner Contact"
          value={ownerContact}
          onChange={(e) => setOwnerContact(e.target.value)}
          className="input-field"
        />
        {error && <p className="center-text" style={{ color: 'red' }}>{error}</p>}
        {message && <p className="center-text" style={{ color: 'green' }}>{message}</p>}
        <button type="submit" className="button-primary">
          Create Library
        </button>
      </form>
      <button onClick={() => navigate('/')} className="fixed-button">
        Return to Home Page
      </button>
    </div>
  );
};

export default CreateLibrary;
