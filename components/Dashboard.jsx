import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    navigate('/');
    return null;
  }
  const user = JSON.parse(storedUser);
  const { Role: role, Name: name } = user;

  let actionButtons = [];
  if (role === 'Owner') {
    actionButtons.push({
      label: 'Onboard Admin',
      onClick: () => navigate('/onboard-admin'),
    });
  } else if (role === 'LibraryAdmin') {
    actionButtons.push(
      { label: 'Add Book', onClick: () => navigate('/add-book') },
      { label: 'Remove Book', onClick: () => navigate('/remove-book') },
      { label: 'Update Book', onClick: () => navigate('/update-book') },
      { label: 'List Issue Requests', onClick: () => navigate('/issue-requests') }
    );
  } else if (role === 'Reader') {
    actionButtons.push(
      { label: 'Search Book', onClick: () => navigate('/search-book') },
      { label: 'Raise Issue Request', onClick: () => navigate('/raise-request') }
    );
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        {actionButtons.map((btn, index) => (
          <button key={index} onClick={btn.onClick} className="nav-button">
            {btn.label}
          </button>
        ))}
      </nav>
      <div className="dashboard-content">
        <h2>Dashboard</h2>
        <h3>
          Welcome, {name}! <br />
          You are a: {role}
        </h3>
      </div>
      <div style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
        <button onClick={() => navigate('/')} className="button-primary">
          Return to Home Page
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
