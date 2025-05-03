
"""
API client for the Creator IQ API.
Handles authentication and making API requests.
"""

import os
import requests
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class CreatorIQClient:
    """
    API client for the Creator IQ API.
    """
    def __init__(self, base_url: str):
        """
        Initialize the API client.
        
        Args:
            base_url: Base URL for the Creator IQ API
        """
        self.base_url = base_url
    
    def call_api(self, route: str, method: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Make a request to the Creator IQ API.
        
        Args:
            route: API route to call
            method: HTTP method to use
            payload: Request parameters
            
        Returns:
            API response as a dictionary
        """
        try:
            # Format route if it contains path parameters
            formatted_route = route
            
            # Handle path parameters (e.g., {publisher_id} in the route)
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
            
            # Log the request for debugging
            logger.info(f"Making Creator IQ API request to: {url}")
            logger.debug(f"Method: {method}, Headers: {headers}, Payload: {payload}")
            
            # Make the request with proper parameter handling
            if method == "GET":
                response = requests.get(url, params=payload, headers=headers)
            elif method == "POST":
                response = requests.post(url, json=payload, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            # Check for errors
            response.raise_for_status()
            
            # Log response status
            logger.info(f"Creator IQ API response status: {response.status_code}")
            
            # Return the response data
            return response.json()
            
        except requests.exceptions.RequestException as e:
            # Handle API errors with more detailed information
            error_message = str(e)
            if hasattr(e, "response") and e.response is not None:
                try:
                    error_data = e.response.json()
                    if isinstance(error_data, dict) and "message" in error_data:
                        error_message = error_data["message"]
                    error_message += f" (Status code: {e.response.status_code})"
                    logger.error(f"Creator IQ API error response: {error_data}")
                except:
                    error_message = f"API error: {e.response.status_code} {e.response.reason}"
            
            logger.error(f"Creator IQ API error: {error_message}")
            raise ValueError(f"Creator IQ API error: {error_message}")
