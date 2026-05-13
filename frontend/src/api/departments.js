import { client } from './client';

export async function listDepartments() {
  const res = await client.get('/departments');
  return res.data?.data ?? res.data;
}
