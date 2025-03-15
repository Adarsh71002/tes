import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateBookAPI } from '../api/api';

const UpdateBook = () => {
  const [isbn, setIsbn] = useState('');
  const [updateData, setUpdateData] = useState({
    title: '',
    authors: '',
    publisher: '',
    version: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    const data = {};
    if (updateData.title.trim()) data.Title = updateData.title;
    if (updateData.authors.trim()) data.Authors = updateData.authors;
    if (updateData.publisher.trim()) data.Publisher = updateData.publisher;
    if (updateData.version.trim()) data.Version = updateData.version;

    if (Object.keys(data).length === 0) {
      setError("Please provide at least one field to update");
      return;
    }

    try {
      await updateBookAPI(isbn, data);
      setMessage('Book details updated successfully');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Update book failed');
    }
  };

  return (
    <div className="page-container">
      <form onSubmit={handleUpdateBook} className="form-container">
        <h2 className="center-text">Update Book</h2>
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
          placeholder="Title (optional)"
          value={updateData.title}
          onChange={(e) => setUpdateData({ ...updateData, title: e.target.value })}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Authors (optional)"
          value={updateData.authors}
          onChange={(e) => setUpdateData({ ...updateData, authors: e.target.value })}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Publisher (optional)"
          value={updateData.publisher}
          onChange={(e) => setUpdateData({ ...updateData, publisher: e.target.value })}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Version (optional)"
          value={updateData.version}
          onChange={(e) => setUpdateData({ ...updateData, version: e.target.value })}
          className="input-field"
        />
        {error && <p className="center-text" style={{ color: 'red' }}>{error}</p>}
        {message && <p className="center-text" style={{ color: 'green' }}>{message}</p>}
        <button type="submit" className="button-primary">
          Update Book
        </button>
      </form>
      <button onClick={() => navigate('/dashboard')} className="fixed-button">
        Return to Dashboard
      </button>
    </div>
  );
};

export default UpdateBook;
