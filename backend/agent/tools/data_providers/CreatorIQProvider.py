
import os
import requests
from typing import Dict, Any, Optional
from agent.tools.data_providers.RapidDataProviderBase import RapidDataProviderBase, EndpointSchema

class CreatorIQProvider(RapidDataProviderBase):
    """
    Provider for Creator IQ API - a CRM system for managing Influencer/Creator relationships.
    """
    
    def __init__(self):
        # Define available endpoints
        endpoints = {
            "creators": {
                "route": "/creators",
                "method": "GET",
                "name": "List Creators",
                "description": "Get a list of creators/influencers",
                "payload": {
                    "limit": "Number of results to return (default: 10)",
                    "offset": "Starting position for pagination",
                    "status": "Filter by creator status (e.g., active, inactive)",
                    "search": "Search term to filter creators by name or other details"
                }
            },
            "creator_details": {
                "route": "/creators/{creator_id}",
                "method": "GET",
                "name": "Get Creator Details",
                "description": "Get detailed information about a specific creator",
                "payload": {
                    "creator_id": "ID of the creator to retrieve"
                }
            },
            "creator_performance": {
                "route": "/creators/{creator_id}/performance",
                "method": "GET",
                "name": "Get Creator Performance",
                "description": "Get performance metrics for a specific creator",
                "payload": {
                    "creator_id": "ID of the creator",
                    "start_date": "Start date for metrics (YYYY-MM-DD)",
                    "end_date": "End date for metrics (YYYY-MM-DD)",
                    "metrics": "Comma-separated list of metrics to include"
                }
            },
            "campaigns": {
                "route": "/campaigns",
                "method": "GET",
                "name": "List Campaigns",
                "description": "Get a list of campaigns",
                "payload": {
                    "limit": "Number of results to return (default: 10)",
                    "offset": "Starting position for pagination",
                    "status": "Filter by campaign status",
                    "brand_id": "Filter by brand ID"
                }
            },
            "campaign_details": {
                "route": "/campaigns/{campaign_id}",
                "method": "GET",
                "name": "Get Campaign Details",
                "description": "Get detailed information about a specific campaign",
                "payload": {
                    "campaign_id": "ID of the campaign to retrieve"
                }
            },
            "content": {
                "route": "/content",
                "method": "GET",
                "name": "List Content",
                "description": "Get a list of content created by influencers",
                "payload": {
                    "limit": "Number of results to return (default: 10)",
                    "offset": "Starting position for pagination",
                    "creator_id": "Filter by creator ID",
                    "campaign_id": "Filter by campaign ID",
                    "content_type": "Filter by content type (e.g., post, video, story)"
                }
            }
        }
        
        # Initialize with base URL and endpoints
        super().__init__(
            base_url="https://api.creatoriq.com/v1",  # Base URL might need to be updated based on actual Creator IQ API
            endpoints=endpoints
        )
    
    def call_endpoint(self, route: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Override the call_endpoint method to handle Creator IQ specific authentication and parameters.
        
        Args:
            route: The endpoint route key
            payload: Dictionary containing parameters for the request
            
        Returns:
            The API response as a dictionary
        """
        try:
            # Get the endpoint configuration
            endpoint = self.endpoints.get(route)
            if not endpoint:
                raise ValueError(f"Endpoint {route} not found in Creator IQ provider")
            
            # Format route if it contains path parameters
            formatted_route = endpoint["route"]
            method = endpoint.get("method", "GET").upper()
            
            # Handle path parameters (e.g., {creator_id} in the route)
            if payload and "{" in formatted_route:
                for key, value in payload.items():
                    if "{" + key + "}" in formatted_route:
                        formatted_route = formatted_route.replace("{" + key + "}", str(value))
                        # Remove used path parameters from payload
                        payload = {k: v for k, v in payload.items() if k != key}
            
            # Build the complete URL
            url = f"{self.base_url}{formatted_route}"
            
            # Get API key from environment variables
            api_key = os.getenv("CREATOR_IQ_API_KEY")
            if not api_key:
                raise ValueError("CREATOR_IQ_API_KEY environment variable not set")
            
            # Set up headers for Creator IQ API
            headers = {
                "Authorization": f"Bearer {api_key}",
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
                    if isinstance(error_data, dict) and "message" in error_data:
                        error_message = error_data["message"]
                    error_message += f" (Status code: {e.response.status_code})"
                except:
                    error_message = f"API error: {e.response.status_code} {e.response.reason}"
            
            raise ValueError(f"Creator IQ API error: {error_message}")

