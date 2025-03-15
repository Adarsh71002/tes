// src/__tests__/RemoveBook.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RemoveBook from '../components/RemoveBook';
import * as api from '../api/api';

// Mock the removeBookAPI function from the API module
vi.mock('../api/api');

describe('RemoveBook Component', () => {
  it('renders the RemoveBook form and navigation button', () => {
    render(
      <BrowserRouter>
        <RemoveBook />
      </BrowserRouter>
    );

    // Verify that the heading is rendered
    expect(screen.getByRole('heading', { name: /Remove Book/i })).toBeInTheDocument();

    // Verify that the input fields are rendered
    expect(screen.getByPlaceholderText('ISBN')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Copies to Remove')).toBeInTheDocument();

    // Verify that the "Remove Book" button (submit) is rendered
    expect(screen.getByRole('button', { name: /Remove Book/i })).toBeInTheDocument();

    // Verify that the "Return to Dashboard" button is rendered
    expect(screen.getByRole('button', { name: /Return to Dashboard/i })).toBeInTheDocument();
  });

  it('submits the form and calls removeBookAPI with the correct payload', async () => {
    // Arrange: set up the API mock to resolve successfully
    api.removeBookAPI.mockResolvedValueOnce({ message: 'Book copies removed successfully' });
    
    render(
      <BrowserRouter>
        <RemoveBook />
      </BrowserRouter>
    );

    // Simulate user input
    fireEvent.change(screen.getByPlaceholderText('ISBN'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText('Copies to Remove'), { target: { value: '2' } });

    // Submit the form by clicking the "Remove Book" button
    fireEvent.click(screen.getByRole('button', { name: /Remove Book/i }));

    // Wait for success message to appear
    await waitFor(() => {
      expect(screen.getByText(/Book copies removed successfully/i)).toBeInTheDocument();
    });

    // Verify that removeBookAPI was called with the correct arguments:
    // It should be called with the isbn and an object containing CopiesToRemove converted to a number.
    expect(api.removeBookAPI).toHaveBeenCalledWith('1234567890', { CopiesToRemove: 2 });
  });
});
