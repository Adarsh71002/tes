import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIssueRequestsAPI, approveIssueRequestAPI, rejectIssueRequestAPI } from '../api/api';

const IssueRequests = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const data = await getIssueRequestsAPI();
      const fetchedRequests = Array.isArray(data.requests) ? data.requests : [];
      setRequests(fetchedRequests);
    } catch (err) {
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Redirect if no pending requests
  useEffect(() => {
    if (!loading && requests.length === 0) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [loading, requests, navigate]);

  const handleApprove = async (reqid) => {
    try {
      await approveIssueRequestAPI(reqid);
      fetchRequests(); // Reload pending requests; approved ones won't appear since approval_date is set.
    } catch (err) {
      setError(err.message || 'Approve failed');
    }
  };

  const handleReject = async (reqid) => {
    try {
      await rejectIssueRequestAPI(reqid);
      setRequests(prev => prev.filter(r => (r.id || r.ID) !== reqid));
    } catch (err) {
      setError(err.message || 'Reject failed');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h2>Issue Requests</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <h2>Issue Requests</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="button-primary">Back to Dashboard</button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="page-container" style={{ textAlign: 'center' }}>
        <h2>Issue Requests</h2>
        <p>No issue requests found.</p>
        <p>Redirecting to Dashboard in 5 seconds...</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '20px' }}>
      <h2 className="center-text">Issue Requests</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
        {requests.map((req) => (
          <div key={req.ID || req.id} className="card">
            <p><strong>Request ID:</strong> {req.ID || req.id}</p>
            <p><strong>Book ISBN:</strong> {req.BookID || req.book_id}</p>
            <p><strong>Reader ID:</strong> {req.ReaderID || req.reader_id}</p>
            <p>
              <strong>Request Date:</strong>{' '}
              {new Date(req.RequestDate || req.request_date).toLocaleDateString()}
            </p>
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => handleApprove(req.ID || req.id)} className="button-primary" style={{ marginRight: '10px' }}>
                Approve
              </button>
              <button onClick={() => handleReject(req.ID || req.id)} className="button-primary">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="center-text" style={{ marginTop: '20px' }}>
        <button onClick={() => navigate('/dashboard')} className="button-primary">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default IssueRequests;
