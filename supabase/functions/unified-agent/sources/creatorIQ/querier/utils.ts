
// Utility functions for Creator IQ API requests

export async function executeGetRequest(
  endpoint: string,
  payload: any,
  apiKey: string
): Promise<any> {
  const url = new URL(`https://apis.creatoriq.com/crm/v1/api/${endpoint}`);
  
  // Add query parameters for GET requests
  if (payload) {
    Object.keys(payload).forEach(key => {
      if (payload[key] !== undefined && payload[key] !== null) {
        url.searchParams.append(key, payload[key].toString());
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'x-api-key': apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`Creator IQ API request failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

export async function executePostRequest(
  endpoint: string,
  payload: any,
  apiKey: string
): Promise<any> {
  const response = await fetch(`https://apis.creatoriq.com/crm/v1/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Creator IQ API request failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

export async function executePatchRequest(
  endpoint: string,
  payload: any,
  apiKey: string
): Promise<any> {
  const response = await fetch(`https://apis.creatoriq.com/crm/v1/api/${endpoint}`, {
    method: 'PATCH',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Creator IQ API request failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

export async function executeDeleteRequest(
  endpoint: string,
  payload: any,
  apiKey: string
): Promise<any> {
  const url = new URL(`https://apis.creatoriq.com/crm/v1/api/${endpoint}`);
  
  // Add query parameters for DELETE requests if needed
  if (payload) {
    Object.keys(payload).forEach(key => {
      if (payload[key] !== undefined && payload[key] !== null) {
        url.searchParams.append(key, payload[key].toString());
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'x-api-key': apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`Creator IQ API request failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Helper function to handle different HTTP methods
export async function executeRequest(
  method: string,
  endpoint: string,
  payload: any,
  apiKey: string
): Promise<any> {
  switch (method.toUpperCase()) {
    case 'GET':
      return executeGetRequest(endpoint, payload, apiKey);
    case 'POST':
      return executePostRequest(endpoint, payload, apiKey);
    case 'PATCH':
      return executePatchRequest(endpoint, payload, apiKey);
    case 'DELETE':
      return executeDeleteRequest(endpoint, payload, apiKey);
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
}

// Helper function to create error result objects
export function createErrorResult(source: string, error: string): any {
  return {
    source,
    results: [],
    error
  };
}

// Helper function to create success result objects
export function createSuccessResult(source: string, results: any[]): any {
  return {
    source,
    results,
    error: null
  };
}
