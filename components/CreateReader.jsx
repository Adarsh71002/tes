import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReaderAPI, getLibrariesAPI } from '../api/api';

const CreateReader = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [libId, setLibId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [libraries, setLibraries] = useState([]);
  const navigate = useNavigate();

  const fetchLibraries = async () => {
    try {
      const data = await getLibrariesAPI();
      const libs = Array.isArray(data.libraries) ? data.libraries : [];
      setLibraries(libs);
    } catch (err) {
      console.error('Failed to fetch libraries', err);
    }
  };

  useEffect(() => {
    fetchLibraries();
  }, []);

  const handleCreateReader = async (e) => {
    e.preventDefault();
    try {
      await createReaderAPI({
        name,
        email,
        contactNumber,  // key must be exactly "contactNumber"
        libID: Number(libId)  // key must be "libID" and value converted to a number
      });
         
      setMessage('Reader created successfully');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Reader creation failed');
    }
  };

  return (
    <div className="page-container" style={{ padding: '20px' }}>
      <div className="form-container" style={{ marginBottom: '40px' }}>
        <h2 className="center-text">Create Reader</h2>
        <form onSubmit={handleCreateReader} className="form-container">
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
          <input
            type="number"
            placeholder="Library ID"
            value={libId}
            onChange={(e) => setLibId(e.target.value)}
            required
            className="input-field"
          />
          {error && <p className="center-text" style={{ color: 'red' }}>{error}</p>}
          {message && <p className="center-text" style={{ color: 'green' }}>{message}</p>}
          <button type="submit" className="button-primary">
            Create Reader
          </button>
        </form>
      </div>
      <div>
        <h2 className="center-text" style={{ marginBottom: '20px' }}>Libraries</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          {libraries.map((library) => (
            <div key={library.id} className="card">
              <p><strong>Library Name:</strong> {library.name}</p>
              <p><strong>Library ID:</strong> {library.id}</p>
              <p><strong>Number of Books:</strong> {library.numBooks}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateReader;
