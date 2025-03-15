import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchBooksAPI, raiseIssueRequestAPI } from '../api/api';

const SearchBook = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await searchBooksAPI({ title, author, publisher });
      setResults(data.books || []);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseRequest = async (isbn) => {
    try {
      await raiseIssueRequestAPI({ ISBN: isbn });
      alert('Issue request raised successfully!');
    } catch (err) {
      alert(err.message || 'Failed to raise issue request');
    }
  };

  return (
    <div className="page-container" style={{ padding: '20px', position: 'relative' }}>
      <div className="form-container" style={{ margin: '0 auto', minHeight: '50vh', textAlign: 'center' }}>
        <h2>Search Book</h2>
        <form onSubmit={handleSearch} className="form-container">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Publisher"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            className="input-field"
          />
          <button type="submit" className="button-primary">Search</button>
        </form>
        {loading && <p style={{ marginTop: '20px' }}>Loading...</p>}
        {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
      </div>

      {results.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
          {results.map((book) => (
            <div key={book.isbn} className="card">
              <p><strong>ISBN:</strong> {book.isbn}</p>
              <p><strong>Title:</strong> {book.title}</p>
              <p><strong>Authors:</strong> {book.authors}</p>
              <p><strong>Publisher:</strong> {book.publisher}</p>
              <p><strong>Version:</strong> {book.version}</p>
              <p><strong>Total Copies:</strong> {book.total_copies}</p>
              <p><strong>Available Copies:</strong> {book.available_copies}</p>
              {/* New: Display availability information */}
              <p><strong>Availability:</strong> {book.availability}</p>
              <button 
                onClick={() => handleRaiseRequest(book.isbn)} 
                className="button-primary" 
                style={{ marginTop: '10px' }}>
                Raise Issue Request
              </button>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => navigate('/dashboard')} className="fixed-button">
        Return to Dashboard
      </button>
    </div>
  );
};

export default SearchBook;
