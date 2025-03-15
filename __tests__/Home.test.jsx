// src/__tests__/Home.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../components/Home';
import { BrowserRouter } from 'react-router-dom';

describe('Home Component', () => {
  test('renders home page with navigation buttons and welcome text', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Library/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Reader/i)).toBeInTheDocument();
    expect(screen.getByText(/Welcome to Our Library Management System/i)).toBeInTheDocument();
  });
});
