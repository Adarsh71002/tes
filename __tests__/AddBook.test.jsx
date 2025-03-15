// src/__tests__/AddBook.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AddBook from '../components/AddBook';
import * as api from '../api/api';

// Mock the addBookAPI function
vi.mock('../api/api');

describe('AddBook Component', () => {
  it('renders the AddBook form', () => {
    render(
      <BrowserRouter>
        <AddBook />
      </BrowserRouter>
    );
    // Use role to specifically select the heading
    expect(screen.getByRole('heading', { name: /Add Book/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ISBN')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
  });

  it('submits the form and calls addBookAPI', async () => {
    // Arrange: set up the API mock to resolve successfully
    api.addBookAPI.mockResolvedValueOnce({ message: 'Book added successfully' });
    
    render(
      <BrowserRouter>
        <AddBook />
      </BrowserRouter>
    );
    
    // Act: simulate user input
    fireEvent.change(screen.getByPlaceholderText('ISBN'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Test Book' } });
    fireEvent.change(screen.getByPlaceholderText('Authors'), { target: { value: 'Test Author' } });
    fireEvent.change(screen.getByPlaceholderText('Publisher'), { target: { value: 'Test Publisher' } });
    fireEvent.change(screen.getByPlaceholderText('Version'), { target: { value: '1.0' } });
    fireEvent.change(screen.getByPlaceholderText('Copies'), { target: { value: '5' } });
    
    // Use getByRole to specifically select the submit button
    fireEvent.click(screen.getByRole('button', { name: /Add Book/i }));
    
    // Assert: wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByText(/Book added successfully/i)).toBeInTheDocument();
    });
    
    // Optionally verify that addBookAPI was called with the expected payload
    expect(api.addBookAPI).toHaveBeenCalledWith({
      isbn: '1234567890',
      title: 'Test Book',
      authors: 'Test Author',
      publisher: 'Test Publisher',
      version: '1.0',
      copies: 5,
    });
  });
});
