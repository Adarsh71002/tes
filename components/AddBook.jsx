import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addBookAPI } from '../api/api';

const AddBook = () => {
  const [isbn, setIsbn] = useState('');
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [publisher, setPublisher] = useState('');
  const [version, setVersion] = useState('');
  const [copies, setCopies] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await addBookAPI({
        isbn,
        title,
        authors,
        publisher,
        version,
        copies: Number(copies),
      });
      setMessage('Book added successfully');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Add book failed');
    }
  };

  return (
    <div className="page-container">
      <form onSubmit={handleAddBook} className="form-container">
        <h2 className="center-text">Add Book</h2>
        <input
          type="text"
          placeholder="ISBN"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="text"
          placeholder="Authors"
          value={authors}
          onChange={(e) => setAuthors(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="text"
          placeholder="Publisher"
          value={publisher}
          onChange={(e) => setPublisher(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Copies"
          value={copies}
          onChange={(e) => setCopies(e.target.value)}
          required
          min="1"
          className="input-field"
        />
        {error && <p className="center-text" style={{ color: 'red' }}>{error}</p>}
        {message && <p className="center-text" style={{ color: 'green' }}>{message}</p>}
        <button type="submit" className="button-primary">
          Add Book
        </button>
      </form>
      <button onClick={() => navigate('/dashboard')} className="fixed-button">
        Return to Dashboard
      </button>
    </div>
  );
};

export default AddBook;
