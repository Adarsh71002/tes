// src/__tests__/CreateReader.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CreateReader from '../components/CreateReader';
import * as api from '../api/api';

// Mock the API functions
vi.mock('../api/api');

describe('CreateReader Component', () => {
  it('renders the CreateReader form and displays libraries', async () => {
    // Arrange: mock getLibrariesAPI to return one library
    api.getLibrariesAPI.mockResolvedValueOnce({ 
      libraries: [{ id: 1, name: 'Library 1', numBooks: 10 }]
    });
    
    render(
      <BrowserRouter>
        <CreateReader />
      </BrowserRouter>
    );
    
    // Assert: Verify that input fields are present
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contact Number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Library ID')).toBeInTheDocument();
    
    // Wait for library data to load and be displayed
    expect(await screen.findByText(/Library 1/i)).toBeInTheDocument();
  });

  it('submits the form and calls createReaderAPI', async () => {
    // Arrange: 
    // First, mock getLibrariesAPI to return an empty list (or any list)
    api.getLibrariesAPI.mockResolvedValueOnce({ libraries: [] });
    // Then, mock createReaderAPI to resolve successfully
    api.createReaderAPI.mockResolvedValueOnce({ message: 'Reader created successfully' });
    
    render(
      <BrowserRouter>
        <CreateReader />
      </BrowserRouter>
    );
    
    // Act: Simulate user filling out the form fields
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Test Reader' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'testreader@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contact Number'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText('Library ID'), { target: { value: '1' } });
    
    // Submit the form by clicking the "Create Reader" button
    fireEvent.click(screen.getByRole('button', { name: /Create Reader/i }));
    
    // Assert: Wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByText(/Reader created successfully/i)).toBeInTheDocument();
    });
    
    // Verify that createReaderAPI was called with the correct payload
    expect(api.createReaderAPI).toHaveBeenCalledWith({
      name: 'Test Reader',
      email: 'testreader@example.com',
      contactNumber: '1234567890',
      libID: 1,
    });
  });
});
