// src/__tests__/CreateLibrary.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CreateLibrary from '../components/CreateLibrary';
import * as api from '../api/api';

// Mock the createLibraryAPI function
vi.mock('../api/api');

describe('CreateLibrary Component', () => {
  it('renders the CreateLibrary form', () => {
    render(
      <BrowserRouter>
        <CreateLibrary />
      </BrowserRouter>
    );
    
    // Verify that all input fields are rendered
    expect(screen.getByPlaceholderText('Library Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Owner Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Owner Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Owner Contact')).toBeInTheDocument();
    
    // Check that the "Create Library" button exists
    expect(screen.getByRole('button', { name: /Create Library/i })).toBeInTheDocument();
    
    // Check that the "Return to Home Page" button exists
    expect(screen.getByRole('button', { name: /Return to Home Page/i })).toBeInTheDocument();
  });

  it('submits the form and calls createLibraryAPI', async () => {
    // Arrange: set up the API mock to resolve successfully
    api.createLibraryAPI.mockResolvedValueOnce({ message: 'Library created successfully' });
    
    render(
      <BrowserRouter>
        <CreateLibrary />
      </BrowserRouter>
    );
    
    // Act: simulate user filling out the form
    fireEvent.change(screen.getByPlaceholderText('Library Name'), { target: { value: 'My Library' } });
    fireEvent.change(screen.getByPlaceholderText('Owner Name'), { target: { value: 'Admin Name' } });
    fireEvent.change(screen.getByPlaceholderText('Owner Email'), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Owner Contact'), { target: { value: '1234567890' } });
    
    // Submit the form by clicking the "Create Library" button
    fireEvent.click(screen.getByRole('button', { name: /Create Library/i }));
    
    // Assert: wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByText(/Library created successfully/i)).toBeInTheDocument();
    });
    
    // Optionally, verify that createLibraryAPI was called with the expected payload
    expect(api.createLibraryAPI).toHaveBeenCalledWith({
      libraryName: 'My Library',
      ownerName: 'Admin Name',
      ownerEmail: 'admin@example.com',
      ownerContact: '1234567890'
    });
  });
});
