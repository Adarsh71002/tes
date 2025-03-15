// src/__tests__/Dashboard.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../components/Dashboard';
import { BrowserRouter } from 'react-router-dom';

describe('Dashboard Component', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ Name: 'Test User', Role: 'Reader' }));
  });
  
  afterEach(() => {
    localStorage.clear();
  });
  
  test('renders dashboard with welcome message and user role', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    expect(screen.getByText(/Welcome, Test User!/i)).toBeInTheDocument();
    expect(screen.getByText(/You are a: Reader/i)).toBeInTheDocument();
  });
});
