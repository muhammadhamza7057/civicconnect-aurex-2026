import { client } from './client';

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

export async function login(payload) {
  const response = await client.post('/auth/login', payload);
  return unwrap(response);
}

export async function register(payload) {
  const response = await client.post('/auth/register', payload);
  return unwrap(response);
}

export async function logout() {
  const response = await client.post('/auth/logout', {});
  return unwrap(response);
}

export async function me() {
  const response = await client.get('/auth/me');
  return unwrap(response);
}

export async function refreshSession() {
  const response = await client.post('/auth/refresh', {});
  return unwrap(response);
}
