
import os
import requests
from typing import Dict, Any, Optional
from agent.tools.data_providers.RapidDataProviderBase import RapidDataProviderBase, EndpointSchema

class GoogleDriveProvider(RapidDataProviderBase):
    """
    Provider for Google Drive API access.
    """
    
    def __init__(self):
        # Define available endpoints
        endpoints = {
            "files": {
                "route": "/files",
                "method": "GET",
                "name": "List Files",
                "description": "Get a list of files from Google Drive",
                "payload": {
                    "query": "Search query to filter files",
                    "pageSize": "Number of files to return (default: 100)",
                    "pageToken": "Token for pagination",
                    "fields": "Fields to include in the response"
                }
            },
            "file_content": {
                "route": "/files/{file_id}/export",
                "method": "GET",
                "name": "Get File Content",
                "description": "Get content of a specific Google Drive file",
                "payload": {
                    "file_id": "ID of the file to retrieve",
                    "mimeType": "MIME type for export (for Google Docs)"
                }
            },
            "file_metadata": {
                "route": "/files/{file_id}",
                "method": "GET",
                "name": "Get File Metadata",
                "description": "Get metadata about a specific file",
                "payload": {
                    "file_id": "ID of the file to retrieve",
                    "fields": "Comma-separated list of fields to include"
                }
            }
        }
        
        # Initialize with base URL and endpoints
        super().__init__(
            base_url="https://www.googleapis.com/drive/v3",
            endpoints=endpoints
        )
    
    def call_endpoint(self, route: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Override the call_endpoint method to handle Google Drive specific authentication and parameters.
        
        Args:
            route: The endpoint route key
            payload: Dictionary containing parameters for the request
            
        Returns:
            The API response as a dictionary
        """
        try:
            # Extract access token from payload
            access_token = None
            if payload and "access_token" in payload:
                access_token = payload.pop("access_token")
            
            if not access_token:
                raise ValueError("No Google Drive access token provided in payload")
                
            # Get the endpoint configuration
            endpoint = self.endpoints.get(route)
            if not endpoint:
                raise ValueError(f"Endpoint {route} not found in Google Drive provider")
            
            # Format route if it contains path parameters
            formatted_route = endpoint["route"]
            method = endpoint.get("method", "GET").upper()
            
            # Handle path parameters (e.g., {file_id} in the route)
            if payload and "{" in formatted_route:
                for key, value in payload.items():
                    if "{" + key + "}" in formatted_route:
                        formatted_route = formatted_route.replace("{" + key + "}", str(value))
                        # Remove used path parameters from payload
                        payload = {k: v for k, v in payload.items() if k != key}
            
            # Build the complete URL
            url = f"{self.base_url}{formatted_route}"
            
            # Set up headers for Google Drive API
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            # Make the request
            if method == "GET":
                response = requests.get(url, params=payload, headers=headers)
            elif method == "POST":
                response = requests.post(url, json=payload, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            # Check for errors
            response.raise_for_status()
            
            # Return the response data
            return response.json()
            
        except requests.exceptions.RequestException as e:
            # Handle API errors
            error_message = str(e)
            if hasattr(e, "response") and e.response is not None:
                try:
                    error_data = e.response.json()
                    if isinstance(error_data, dict) and "error" in error_data:
                        if isinstance(error_data["error"], dict) and "message" in error_data["error"]:
                            error_message = error_data["error"]["message"]
                        else:
                            error_message = str(error_data["error"])
                    error_message += f" (Status code: {e.response.status_code})"
                except:
                    error_message = f"API error: {e.response.status_code} {e.response.reason}"
            
            raise ValueError(f"Google Drive API error: {error_message}")
