// src/__tests__/OnboardAdmin.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import OnboardAdmin from '../components/OnboardAdmin';
import * as api from '../api/api';

// Mock the onboardAdminAPI function
vi.mock('../api/api');

describe('OnboardAdmin Component', () => {
  it('renders the OnboardAdmin form correctly', () => {
    render(
      <BrowserRouter>
        <OnboardAdmin />
      </BrowserRouter>
    );
    
    // Verify that the heading is present
    expect(screen.getByRole('heading', { name: /Onboard Library Admin/i })).toBeInTheDocument();
    
    // Verify that the input fields are present
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contact Number')).toBeInTheDocument();
    
    // Verify that the "Onboard Admin" button exists
    expect(screen.getByRole('button', { name: /Onboard Admin/i })).toBeInTheDocument();
    
    // Verify that the "Return to Home Page" button exists
    expect(screen.getByRole('button', { name: /Return to Home Page/i })).toBeInTheDocument();
  });

  it('submits the form and calls onboardAdminAPI with correct payload', async () => {
    // Arrange: mock the API to resolve with a success message
    api.onboardAdminAPI.mockResolvedValueOnce({ message: 'Admin onboarded successfully' });
    
    render(
      <BrowserRouter>
        <OnboardAdmin />
      </BrowserRouter>
    );
    
    // Act: simulate user input
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Admin Name' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contact Number'), { target: { value: '1234567890' } });
    
    // Submit the form by clicking the "Onboard Admin" button
    fireEvent.click(screen.getByRole('button', { name: /Onboard Admin/i }));
    
    // Assert: wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByText(/Admin onboarded successfully/i)).toBeInTheDocument();
    });
    
    // Optionally, verify that onboardAdminAPI was called with the correct payload
    expect(api.onboardAdminAPI).toHaveBeenCalledWith({
      name: 'Admin Name',
      email: 'admin@example.com',
      contactNumber: '1234567890',
    });
  });
});
