import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const goToSignIn = () => navigate('/signin');
  const goToCreateLibrary = () => navigate('/create-library');
  const goToCreateReader = () => navigate('/create-reader');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="home-nav">
        <button onClick={goToSignIn}>Sign In</button>
        <button onClick={goToCreateLibrary}>Create Library</button>
        <button onClick={goToCreateReader}>Create Reader</button>
      </nav>
      <div style={{ backgroundColor: 'hsl(160, 8%, 85%)', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 50px' }}>
        <h1 style={{ fontWeight: 'bold', textAlign: 'center' }}>
          Welcome to Our Library Management System
        </h1>
      </div>
    </div>
  );
};

export default Home;
