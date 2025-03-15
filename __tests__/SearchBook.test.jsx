// src/__tests__/SearchBook.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SearchBook from '../components/SearchBook';
import * as api from '../api/api';

// Mock the API functions
vi.mock('../api/api');

describe('SearchBook Component', () => {
  it('renders the search form and navigation button', () => {
    render(
      <BrowserRouter>
        <SearchBook />
      </BrowserRouter>
    );
    
    // Check that the input fields and buttons are rendered
    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Author')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Publisher')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Return to Dashboard/i })).toBeInTheDocument();
  });

  it('displays search results after a successful search', async () => {
    // Arrange: set up the mock to return one book result
    api.searchBooksAPI.mockResolvedValueOnce({
      books: [
        {
          isbn: '1234567890',
          title: 'Test Book',
          authors: 'Test Author',
          publisher: 'Test Publisher',
          version: '1.0',
          total_copies: 5,
          available_copies: 0,
          availability: 'Not available, expected return: 2025-03-30'
        }
      ]
    });
    
    render(
      <BrowserRouter>
        <SearchBook />
      </BrowserRouter>
    );
    
    // Act: simulate filling in the search fields and submitting the form
    fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Test Book' } });
    fireEvent.change(screen.getByPlaceholderText('Author'), { target: { value: 'Test Author' } });
    fireEvent.change(screen.getByPlaceholderText('Publisher'), { target: { value: 'Test Publisher' } });
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));
    
    // Assert: wait for the result card to appear
    await waitFor(() => {
      expect(screen.getByText(/Test Book/i)).toBeInTheDocument();
    });
    
    // Also verify that availability info is displayed
    expect(screen.getByText(/Not available, expected return:/i)).toBeInTheDocument();
  });

  it('calls alert on clicking "Raise Issue Request"', async () => {
    // Arrange: mock raiseIssueRequestAPI to resolve successfully
    api.raiseIssueRequestAPI.mockResolvedValueOnce({ message: 'Issue request raised successfully' });
    // Spy on window.alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Also mock a search to display a result card
    api.searchBooksAPI.mockResolvedValueOnce({
      books: [
        {
          isbn: '1234567890',
          title: 'Test Book',
          authors: 'Test Author',
          publisher: 'Test Publisher',
          version: '1.0',
          total_copies: 5,
          available_copies: 2,
          availability: 'Available'
        }
      ]
    });
    
    render(
      <BrowserRouter>
        <SearchBook />
      </BrowserRouter>
    );
    
    // Act: perform search to load results
    fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Test Book' } });
    fireEvent.change(screen.getByPlaceholderText('Author'), { target: { value: 'Test Author' } });
    fireEvent.change(screen.getByPlaceholderText('Publisher'), { target: { value: 'Test Publisher' } });
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));
    
    // Wait for the card to appear
    await waitFor(() => {
      expect(screen.getByText(/Test Book/i)).toBeInTheDocument();
    });
    
    // Act: click on the "Raise Issue Request" button on the result card
    fireEvent.click(screen.getByRole('button', { name: /Raise Issue Request/i }));
    
    // Assert: verify that alert is called with the success message
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Issue request raised successfully!');
    });
    
    alertSpy.mockRestore();
  });
});
