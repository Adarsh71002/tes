// API helper functions to interact with the backend endpoints.
export async function signInAPI(email) {
  const response = await fetch('/api/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Sign in failed');
  }
  return await response.json();
}

export async function createLibraryAPI(data) {
  const response = await fetch('/api/library/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Library creation failed');
  }
  return await response.json();
}

export async function createReaderAPI(data) {
  const response = await fetch('/api/reader/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Reader creation failed');
  }
  return await response.json();
}

export async function onboardAdminAPI(data) {
  const user = JSON.parse(localStorage.getItem('user'));
  const email = user.email || user.Email;
  const response = await fetch('/api/owner/admin/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Email': email,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Onboard admin failed');
  }
  return await response.json();
}

export async function addBookAPI(data) {
  const user = JSON.parse(localStorage.getItem('user'));
  const email = user.email || user.Email;
  const response = await fetch('/api/admin/books', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Email': email,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Add book failed');
  }
  return await response.json();
}

export async function removeBookAPI(isbn, data) {
  const user = JSON.parse(localStorage.getItem('user'));
  const email = user.email || user.Email;
  const response = await fetch(`/api/admin/books/${isbn}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Email': email,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Remove book failed');
  }
  return await response.json();
}

export async function updateBookAPI(isbn, data) {
  const user = JSON.parse(localStorage.getItem('user'));
  const email = user.email || user.Email;
  const response = await fetch(`/api/admin/books/${isbn}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Email': email,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Update book failed');
  }
  return await response.json();
}

export async function getIssueRequestsAPI() {
  const user = JSON.parse(localStorage.getItem('user'));
  const email = user.email || user.Email;
  const response = await fetch(`/api/admin/requests`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Email': email,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch issue requests');
  }
  return await response.json();
}

export async function approveIssueRequestAPI(reqid) {
  const user = JSON.parse(localStorage.getItem('user'));
  const email = user.email || user.Email;
  const response = await fetch(`/api/admin/requests/${reqid}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Email': email,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Approve failed');
  }
  return await response.json();
}

export async function rejectIssueRequestAPI(reqid) {
  const user = JSON.parse(localStorage.getItem('user'));
  const email = user.email || user.Email;
  const response = await fetch(`/api/admin/requests/${reqid}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Email': email,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Reject failed');
  }
  return await response.json();
}

export async function searchBooksAPI(query) {
  const user = JSON.parse(localStorage.getItem('user'));
  const email = user.email || user.Email;
  const params = new URLSearchParams(query);
  const response = await fetch(`/api/reader/books?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Email': email,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Search books failed');
  }
  return await response.json();
}

export async function raiseIssueRequestAPI(data) {
  const user = JSON.parse(localStorage.getItem('user'));
  const email = user.email || user.Email;
  const response = await fetch('/api/reader/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Email': email,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Raise issue request failed');
  }
  return await response.json();
}

export async function getLibrariesAPI() {
  const response = await fetch('/api/libraries', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch libraries');
  }
  return await response.json();
}
