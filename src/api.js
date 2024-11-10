// src/api.js

// fragments microservice API to use, defaults to localhost:8080 if not set in env
const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
/**
 * Create users fragments
 */
export async function getUserFragments(user) {
  console.log('Requesting user fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      // Generate headers with the proper Authorization bearer token to pass.
      // We are using the `authorizationHeaders()` helper method we defined
      // earlier, to automatically attach the user's ID token.
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Successfully got user fragments data', { data });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
  }
}

/**
 * Create New Fragment
 */
export async function createNewFragment(content, type, user) {
  console.log('Creating fragment:', { content, type });
  console.log('User object:', user);

  if (!user || !user.idToken) {
    throw new Error('No authenticated user or missing token');
  }

  try {
    const headers = {
      'Content-Type': type,
      Authorization: `Bearer ${user.idToken}`,
    };
    console.log('Request headers:', headers);

    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'POST',
      headers,
      body: content,
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Fragment created successfully:', data);
    return data;
  } catch (err) {
    console.error('Error creating fragment:', err);
    throw err;
  }
}
export async function getFragmentsExpanded(user) {
  console.log('Getting expanded fragments list');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments?expand=1`, {
      headers: {
        Authorization: `Bearer ${user.idToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Got expanded fragments:', data);
    return data;
  } catch (err) {
    console.error('Error getting expanded fragments:', err);
    throw err;
  }
}
