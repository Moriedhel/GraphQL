// GraphQL fetch helper and common queries
// Uses AbortController and proper error propagation

import { getToken } from './auth.js';

const GQL_ENDPOINT = 'https://platform.zone01.gr/api/graphql-engine/v1/graphql';

export async function fetchGraphQL(query, variables = {}, { signal } = {}) {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(GQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
    signal,
  });

  const json = await res.json();
  if (!res.ok || json.errors) {
    const msg = json.errors?.[0]?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.response = json;
    throw err;
  }
  return json.data;
}

// Sample queries (normal, nested, with variables)
export const QUERY_USER = `
  { user { id login email } }
`;

export const QUERY_RESULTS_NESTED = `
  query($limit: Int = 100) {
    result(limit: $limit, order_by: { createdAt: asc }) {
      id
      grade
      createdAt
      user { id login }
    }
  }
`;

export const QUERY_OBJECT_BY_ID = `
  query($id: Int!) {
    object(where: { id: { _eq: $id } }) { id name type }
  }
`;

export const QUERY_OBJECTS_BY_IDS = `
  query($ids: [Int!]!) {
    object(where: { id: { _in: $ids } }) { id name type }
  }
`;

export const QUERY_TRANSACTIONS_XP = `
  {
    transaction(where: { type: { _eq: "xp" } }, order_by: { createdAt: asc }) {
      amount
      objectId
      createdAt
      path
    }
  }
`;
