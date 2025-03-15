// src/__tests__/RaiseRequest.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RaiseRequest from '../components/RaiseRequest';
import * as api from '../api/api';

// Mock the raiseIssueRequestAPI function
vi.mock('../api/api');

describe('RaiseRequest Component', () => {
  it('renders the RaiseIssueRequest form and buttons', () => {
    render(
      <BrowserRouter>
        <RaiseRequest />
      </BrowserRouter>
    );

    // Check for the heading
    expect(screen.getByRole('heading', { name: /Raise Issue Request/i })).toBeInTheDocument();
    // Check for the input field
    expect(screen.getByPlaceholderText(/Enter Book ISBN/i)).toBeInTheDocument();
    // Check for the submit button
    expect(screen.getByRole('button', { name: /Raise Issue Request/i })).toBeInTheDocument();
    // Check for the navigation button
    expect(screen.getByRole('button', { name: /Return to Dashboard/i })).toBeInTheDocument();
  });

  it('submits the form successfully and displays success message', async () => {
    // Arrange: mock the API to resolve with a success message
    api.raiseIssueRequestAPI.mockResolvedValueOnce({ message: 'Issue request raised successfully' });

    render(
      <BrowserRouter>
        <RaiseRequest />
      </BrowserRouter>
    );

    const isbnInput = screen.getByPlaceholderText(/Enter Book ISBN/i);
    fireEvent.change(isbnInput, { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /Raise Issue Request/i }));

    // Assert: Wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByText(/Issue request raised successfully/i)).toBeInTheDocument();
    });
    // Also, ensure the input is cleared after success
    expect(isbnInput.value).toBe('');
  });

  it('displays error message if the API call fails', async () => {
    // Arrange: mock the API to reject with an error
    api.raiseIssueRequestAPI.mockRejectedValueOnce(new Error('Failed to raise issue request'));

    render(
      <BrowserRouter>
        <RaiseRequest />
      </BrowserRouter>
    );

    const isbnInput = screen.getByPlaceholderText(/Enter Book ISBN/i);
    fireEvent.change(isbnInput, { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /Raise Issue Request/i }));

    // Assert: Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to raise issue request/i)).toBeInTheDocument();
    });
  });
});
