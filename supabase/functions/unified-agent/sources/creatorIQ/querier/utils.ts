
import type { QueryPayload } from './types.ts';

const CREATOR_IQ_BASE_URL = 'https://apis.creatoriq.com/crm/v1/api';

export async function executeGetRequest(
  path: string,
  payload: QueryPayload,
  apiKey: string
): Promise<any> {
  const url = new URL(`${CREATOR_IQ_BASE_URL}${path}`);
  
  // Add query parameters
  if (payload.query_params) {
    Object.entries(payload.query_params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function executePostRequest(
  path: string,
  payload: QueryPayload,
  apiKey: string
): Promise<any> {
  const url = `${CREATOR_IQ_BASE_URL}${path}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload.body_params || {})
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function executePatchRequest(
  path: string,
  payload: QueryPayload,
  apiKey: string
): Promise<any> {
  const url = `${CREATOR_IQ_BASE_URL}${path}`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload.body_params || {})
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function executeDeleteRequest(
  path: string,
  payload: QueryPayload,
  apiKey: string
): Promise<any> {
  const url = `${CREATOR_IQ_BASE_URL}${path}`;
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'x-api-key': apiKey,
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}
