// src/__tests__/IssueRequests.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import IssueRequests from '../components/IssueRequests';
import * as api from '../api/api';

// Declare a mock function for useNavigate
const mockNavigate = vi.fn();

// Override react-router-dom to use our mock for useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the API functions
vi.mock('../api/api');

describe('IssueRequests Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays a loading state initially', () => {
    // Arrange: Return a never-resolving promise for getIssueRequestsAPI
    api.getIssueRequestsAPI.mockReturnValue(new Promise(() => {}));
    render(
      <BrowserRouter>
        <IssueRequests />
      </BrowserRouter>
    );
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('displays an error message if API call fails', async () => {
    api.getIssueRequestsAPI.mockRejectedValueOnce(new Error('Failed to fetch requests'));
    render(
      <BrowserRouter>
        <IssueRequests />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch requests/i)).toBeInTheDocument();
    });
  });

  /*it('renders "No issue requests found" and redirects when there are no requests', async () => {
    api.getIssueRequestsAPI.mockResolvedValueOnce({ requests: [] });
    render(
      <BrowserRouter>
        <IssueRequests />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/No issue requests found/i)).toBeInTheDocument();
    });
    // Use fake timers for the redirection delay
    vi.useFakeTimers();
    // Flush all timers
    vi.runAllTimers();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
    vi.useRealTimers();
  }, 6000); // Increase timeout if needed

  /*it('renders a list of requests and handles approve action', async () => {
    const requestData = {
      requests: [
        {
          ID: 1,
          BookID: '1234567890',
          ReaderID: 2,
          RequestDate: new Date().toISOString(),
        },
      ],
    };
    // First call returns the request data
    api.getIssueRequestsAPI.mockResolvedValueOnce(requestData);
    render(
      <BrowserRouter>
        <IssueRequests />
      </BrowserRouter>
    );
    // Wait for the request to appear
    await waitFor(() => {
      expect(screen.getByText(/1234567890/i)).toBeInTheDocument();
    });
    // Arrange: Mock the approve API call
    api.approveIssueRequestAPI.mockResolvedValueOnce({ message: 'Issue request approved and book issued' });
    // Then, when fetchRequests is called again, return an empty list
    api.getIssueRequestsAPI.mockResolvedValueOnce({ requests: [] });
    // Act: Click the Approve button
    fireEvent.click(screen.getByRole('button', { name: /Approve/i }));
    // Assert: Wait for the request to be removed
    await waitFor(
      () => {
        expect(screen.queryByText(/1234567890/i)).not.toBeInTheDocument();
      },
      { timeout: 6000 } // Increase timeout to allow for async re-fetch
    );
  });

  it('handles reject action by removing the request from the list', async () => {
    const requestData = {
      requests: [
        {
          ID: 1,
          BookID: '1234567890',
          ReaderID: 2,
          RequestDate: new Date().toISOString(),
        },
      ],
    };
    api.getIssueRequestsAPI.mockResolvedValueOnce(requestData);
    render(
      <BrowserRouter>
        <IssueRequests />
      </BrowserRouter>
    );
    // Wait for the request card to appear
    await waitFor(() => {
      expect(screen.getByText(/1234567890/i)).toBeInTheDocument();
    });
    // Arrange: Mock the reject API call
    api.rejectIssueRequestAPI.mockResolvedValueOnce({ message: 'Issue request rejected' });
    // Act: Click the Reject button
    fireEvent.click(screen.getByRole('button', { name: /Reject/i }));
    // Assert: Wait for the request card to be removed
    await waitFor(
      () => {
        expect(screen.queryByText(/1234567890/i)).not.toBeInTheDocument();
      },
      { timeout: 6000 }
    );
  });*/
});
