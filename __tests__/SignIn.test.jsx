// src/__tests__/SignIn.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SignIn from '../components/SignIn';
import * as api from '../api/api';

// Mock the API function from our API module
vi.mock('../api/api');

// Create a mock for useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SignIn Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
  });

  it('renders the sign in form', () => {
    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('submits the form and calls signInAPI, stores user, and navigates to dashboard', async () => {
    // Arrange: set up the API mock to return a user object
    const mockUser = { Name: 'Test User', Role: 'Reader', Email: 'test@example.com' };
    api.signInAPI.mockResolvedValueOnce(mockUser);

    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );

    // Act: simulate entering an email and submitting the form
    const emailInput = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Assert: wait for the API call, localStorage update, and navigation to occur
    await waitFor(() => {
      expect(api.signInAPI).toHaveBeenCalledWith('test@example.com');
      expect(localStorage.getItem('user')).toEqual(JSON.stringify(mockUser));
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
