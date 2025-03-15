import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInAPI } from '../api/api';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const user = await signInAPI(email);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Sign in failed');
    }
  };

  return (
    <div className="page-container" style={{ height: '100vh' }}>
      <div className="center-text">
        <h2 style={{ marginBottom: '20px' }}>Sign In</h2>
        <form onSubmit={handleSignIn}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            style={{ width: '300px', height: '40px', borderRadius: '5px', border: '1px solid #ccc' }}
            required
          />
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          <br />
          <button type="submit" className="button-primary" style={{ marginTop: '20px', width: '300px', height: '40px' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
