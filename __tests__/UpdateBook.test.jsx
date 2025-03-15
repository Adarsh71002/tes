// src/__tests__/UpdateBook.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import UpdateBook from '../components/UpdateBook';
import * as api from '../api/api';

// Mock the updateBookAPI function
vi.mock('../api/api');

describe('UpdateBook Component', () => {
  it('renders the UpdateBook form correctly', () => {
    render(
      <BrowserRouter>
        <UpdateBook />
      </BrowserRouter>
    );
    
    // Check for the heading using role
    expect(screen.getByRole('heading', { name: /Update Book/i })).toBeInTheDocument();
    
    // Verify that all input fields are present
    expect(screen.getByPlaceholderText('ISBN')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Title (optional)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Authors (optional)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Publisher (optional)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Version (optional)')).toBeInTheDocument();
    
    // Check that the submit and navigation buttons exist
    expect(screen.getByRole('button', { name: /Update Book/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Return to Dashboard/i })).toBeInTheDocument();
  });

  it('shows an error when no update fields are provided', async () => {
    render(
      <BrowserRouter>
        <UpdateBook />
      </BrowserRouter>
    );
    
    // Fill only the ISBN field
    fireEvent.change(screen.getByPlaceholderText('ISBN'), { target: { value: '1234567890' } });
    
    // Click the "Update Book" button
    fireEvent.click(screen.getByRole('button', { name: /Update Book/i }));
    
    // Expect error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Please provide at least one field to update/i)).toBeInTheDocument();
    });
  });

  it('submits the form with valid update fields and calls updateBookAPI', async () => {
    // Arrange: mock updateBookAPI to resolve successfully
    api.updateBookAPI.mockResolvedValueOnce({ message: 'Book details updated successfully' });
    
    render(
      <BrowserRouter>
        <UpdateBook />
      </BrowserRouter>
    );
    
    // Fill in ISBN and at least one update field (Title and Authors, for example)
    fireEvent.change(screen.getByPlaceholderText('ISBN'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText('Title (optional)'), { target: { value: 'Updated Title' } });
    fireEvent.change(screen.getByPlaceholderText('Authors (optional)'), { target: { value: 'Updated Authors' } });
    // Optionally fill in Publisher
    fireEvent.change(screen.getByPlaceholderText('Publisher (optional)'), { target: { value: 'Updated Publisher' } });
    // Not providing Version in this test
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Update Book/i }));
    
    // Assert: Wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByText(/Book details updated successfully/i)).toBeInTheDocument();
    });
    
    // Verify that updateBookAPI was called with the correct payload:
    // The handler constructs the payload using keys "Title", "Authors", "Publisher", and "Version"
    expect(api.updateBookAPI).toHaveBeenCalledWith('1234567890', {
      Title: 'Updated Title',
      Authors: 'Updated Authors',
      Publisher: 'Updated Publisher'
      // "Version" is omitted since no value was provided.
    });
  });
});
