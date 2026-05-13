import { client } from './client';

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

export async function getMyTickets(params = {}) {
  const response = await client.get('/tickets/my', { params });
  return unwrap(response);
}

export async function getTickets(params = {}) {
  const response = await client.get('/tickets', { params });
  return unwrap(response);
}

export async function getTicketById(id) {
  const response = await client.get(`/tickets/${id}`);
  return unwrap(response);
}

export async function createTicket(payload) {
  const response = await client.post('/tickets', payload);
  return unwrap(response);
}

export async function updateTicketStatus(id, status) {
  const response = await client.put(`/tickets/${id}/status`, { status });
  return unwrap(response);
}

export async function assignTicket(id, assigneeId) {
  const response = await client.post(`/tickets/${id}/assign`, { assigneeId });
  return unwrap(response);
}

export async function addTicketComment(id, body, visibility = 'public') {
  const response = await client.post(`/tickets/${id}/comments`, { message: body, visibility });
  return unwrap(response);
}

export async function getTicketTimeline(id) {
  const response = await client.get(`/tickets/${id}/timeline`);
  return unwrap(response);
}
