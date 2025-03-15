import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeBookAPI } from '../api/api';

const RemoveBook = () => {
  const [isbn, setIsbn] = useState('');
  const [copiesToRemove, setCopiesToRemove] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRemoveBook = async (e) => {
    e.preventDefault();
    try {
      await removeBookAPI(isbn, { CopiesToRemove: Number(copiesToRemove) });
      setMessage('Book copies removed successfully');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Remove book failed');
    }
  };

  return (
    <div className="page-container">
      <form onSubmit={handleRemoveBook} className="form-container">
        <h2 className="center-text">Remove Book</h2>
        <input
          type="text"
          placeholder="ISBN"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="number"
          placeholder="Copies to Remove"
          value={copiesToRemove}
          onChange={(e) => setCopiesToRemove(e.target.value)}
          required
          min="1"
          className="input-field"
        />
        {error && <p className="center-text" style={{ color: 'red' }}>{error}</p>}
        {message && <p className="center-text" style={{ color: 'green' }}>{message}</p>}
        <button type="submit" className="button-primary">
          Remove Book
        </button>
      </form>
      <button onClick={() => navigate('/dashboard')} className="fixed-button">
        Return to Dashboard
      </button>
    </div>
  );
};

export default RemoveBook;
