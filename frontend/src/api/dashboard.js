import { client } from './client';

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

export async function getDashboardSummary() {
  const response = await client.get('/analytics/summary');
  return unwrap(response);
}

export async function getDepartments() {
  const response = await client.get('/departments');
  return unwrap(response);
}

export async function getAnnouncements() {
  const response = await client.get('/announcements');
  return unwrap(response);
}
