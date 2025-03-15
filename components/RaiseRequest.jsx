import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { raiseIssueRequestAPI } from '../api/api';

const RaiseRequest = () => {
  const [isbn, setIsbn] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRaiseRequest = async (e) => {
    e.preventDefault();
    try {
      await raiseIssueRequestAPI({ ISBN: isbn });
      setMessage('Issue request raised successfully');
      setIsbn('');
    } catch (err) {
      setError(err.message || 'Failed to raise issue request');
    }
  };

  return (
    <div className="page-container">
      <form onSubmit={handleRaiseRequest} className="form-container" style={{ textAlign: 'center' }}>
        <h2>Raise Issue Request</h2>
        <input
          type="text"
          placeholder="Enter Book ISBN"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          required
          className="input-field"
        />
        {error && <p className="center-text" style={{ color: 'red' }}>{error}</p>}
        {message && <p className="center-text" style={{ color: 'green' }}>{message}</p>}
        <button type="submit" className="button-primary">
          Raise Issue Request
        </button>
      </form>
      <button onClick={() => navigate('/dashboard')} className="fixed-button">
        Return to Dashboard
      </button>
    </div>
  );
};

export default RaiseRequest;
