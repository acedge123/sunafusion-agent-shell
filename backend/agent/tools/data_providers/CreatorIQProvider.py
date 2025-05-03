
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
            "publishers": {
                "route": "/publishers",
                "method": "GET",
                "name": "List Publishers",
                "description": "Get a list of publishers/influencers",
                "payload": {
                    "limit": "Number of results to return (default: 10)",
                    "offset": "Starting position for pagination",
                    "status": "Filter by publisher status (e.g., active, inactive)",
                    "search": "Search term to filter publishers by name or other details"
                }
            },
            "publisher_details": {
                "route": "/publishers/{publisher_id}",
                "method": "GET",
                "name": "Get Publisher Details",
                "description": "Get detailed information about a specific publisher",
                "payload": {
                    "publisher_id": "ID of the publisher to retrieve"
                }
            },
            "publisher_performance": {
                "route": "/publishers/{publisher_id}/performance",
                "method": "GET",
                "name": "Get Publisher Performance",
                "description": "Get performance metrics for a specific publisher",
                "payload": {
                    "publisher_id": "ID of the publisher",
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
                    "brand_id": "Filter by brand ID",
                    "search": "Search term to filter campaigns by name"
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
            "campaign_publishers": {
                "route": "/campaigns/{campaign_id}/publishers",
                "method": "GET",
                "name": "Get Campaign Publishers",
                "description": "Get all publishers associated with a specific campaign",
                "payload": {
                    "campaign_id": "ID of the campaign",
                    "limit": "Number of results to return (default: 10)",
                    "offset": "Starting position for pagination"
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
                    "publisher_id": "Filter by publisher ID",
                    "campaign_id": "Filter by campaign ID",
                    "content_type": "Filter by content type (e.g., post, video, story)"
                }
            },
            # List endpoints
            "lists": {
                "route": "/lists",
                "method": "GET",
                "name": "Get Lists",
                "description": "Get a list of all publisher lists",
                "payload": {
                    "limit": "Number of results to return (default: 10)",
                    "offset": "Starting position for pagination",
                    "search": "Search term to filter lists by name or other details",
                    "status": "Filter by list status"
                }
            },
            "list_details": {
                "route": "/lists/{list_id}",
                "method": "GET",
                "name": "Get List Details", 
                "description": "Get detailed information about a specific list",
                "payload": {
                    "list_id": "ID of the list to retrieve"
                }
            },
            "list_publishers": {
                "route": "/lists/{list_id}/publishers",
                "method": "GET",
                "name": "Get Publishers in List",
                "description": "Get all publishers that are part of a specific list",
                "payload": {
                    "list_id": "ID of the list",
                    "limit": "Number of results to return (default: 50)",
                    "offset": "Starting position for pagination"
                }
            }
        }
        
        # Initialize with the correct base URL and endpoints
        super().__init__(
            base_url="https://apis.creatoriq.com/crm/v1/api",
            endpoints=endpoints
        )
    
    def find_by_name(self, entity_type: str, name: str) -> Optional[Dict[str, Any]]:
        """
        Search for an entity (list, campaign, publisher) by name and return its ID and details.
        
        Args:
            entity_type: Type of entity to search for ('lists', 'campaigns', 'publishers')
            name: Name or search term to find the entity
            
        Returns:
            Dictionary with entity ID and details or None if not found
        """
        try:
            if entity_type not in ['lists', 'campaigns', 'publishers']:
                raise ValueError(f"Unsupported entity type: {entity_type}")
                
            # Prepare search payload
            search_payload = {
                "limit": 50,  # Fetch more results to increase chances of finding the entity
                "search": name
            }
            
            # Call the endpoint to search entities
            response = self.call_endpoint(entity_type, search_payload)
            
            # Extract response data
            if not response or 'data' not in response:
                print(f"No data returned from {entity_type} search for '{name}'")
                return None
                
            items = response.get('data', [])
            total = response.get('meta', {}).get('total', 0)
            
            if not items or total == 0:
                print(f"No {entity_type} found matching '{name}'")
                return None
                
            # Search for exact or close match in the returned items
            for item in items:
                # The property name varies by entity type
                item_name = ""
                if entity_type == 'lists':
                    item_name = item.get('name', '')
                elif entity_type == 'campaigns':
                    item_name = item.get('name', '')
                elif entity_type == 'publishers':
                    item_name = item.get('name', '') or f"{item.get('first_name', '')} {item.get('last_name', '')}".strip()
                
                # Check for exact match first
                if item_name.lower() == name.lower():
                    print(f"Found exact match for {entity_type} '{name}': ID {item.get('id')}")
                    return {"id": item.get('id'), "details": item}
            
            # If no exact match, return the first item as best match
            first_match = items[0]
            if entity_type == 'lists':
                item_name = first_match.get('name', '')
            elif entity_type == 'campaigns':
                item_name = first_match.get('name', '')
            elif entity_type == 'publishers':
                item_name = first_match.get('name', '') or f"{first_match.get('first_name', '')} {first_match.get('last_name', '')}".strip()
            
            print(f"No exact match found, using best match for {entity_type}: '{item_name}' with ID {first_match.get('id')}")
            return {"id": first_match.get('id'), "details": first_match}
            
        except Exception as e:
            print(f"Error searching for {entity_type} by name '{name}': {str(e)}")
            return None
    
    def get_publishers_in_list(self, list_name: str) -> Dict[str, Any]:
        """
        Two-step process to get publishers in a list:
        1. Find the list ID by name
        2. Get publishers in that list
        
        Args:
            list_name: Name of the list to search for
            
        Returns:
            Dictionary with list details and publishers
        """
        # Step 1: Find the list by name
        list_data = self.find_by_name('lists', list_name)
        if not list_data or 'id' not in list_data:
            return {"error": f"Could not find list with name '{list_name}'"}
        
        list_id = list_data["id"]
        list_details = list_data["details"]
        
        # Step 2: Get publishers in the list
        try:
            payload = {
                "list_id": list_id,
                "limit": 50  # Fetch up to 50 publishers
            }
            publishers_response = self.call_endpoint("list_publishers", payload)
            
            # Prepare a comprehensive response with list details and publishers
            return {
                "list": list_details,
                "publishers": publishers_response.get("data", []),
                "total_publishers": publishers_response.get("meta", {}).get("total", 0),
                "list_id": list_id
            }
        except Exception as e:
            return {
                "error": f"Error getting publishers for list '{list_name}' (ID: {list_id}): {str(e)}",
                "list_id": list_id,
                "list": list_details
            }
    
    def get_publishers_in_campaign(self, campaign_name: str) -> Dict[str, Any]:
        """
        Two-step process to get publishers in a campaign:
        1. Find the campaign ID by name
        2. Get publishers in that campaign
        
        Args:
            campaign_name: Name of the campaign to search for
            
        Returns:
            Dictionary with campaign details and publishers
        """
        # Step 1: Find the campaign by name
        campaign_data = self.find_by_name('campaigns', campaign_name)
        if not campaign_data or 'id' not in campaign_data:
            return {"error": f"Could not find campaign with name '{campaign_name}'"}
        
        campaign_id = campaign_data["id"]
        campaign_details = campaign_data["details"]
        
        # Step 2: Get publishers in the campaign
        try:
            payload = {
                "campaign_id": campaign_id,
                "limit": 50  # Fetch up to 50 publishers
            }
            publishers_response = self.call_endpoint("campaign_publishers", payload)
            
            # Prepare a comprehensive response
            return {
                "campaign": campaign_details,
                "publishers": publishers_response.get("data", []),
                "total_publishers": publishers_response.get("meta", {}).get("total", 0),
                "campaign_id": campaign_id
            }
        except Exception as e:
            return {
                "error": f"Error getting publishers for campaign '{campaign_name}' (ID: {campaign_id}): {str(e)}",
                "campaign_id": campaign_id,
                "campaign": campaign_details
            }
    
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
            print(f"Making Creator IQ API request to: {url}")
            print(f"Method: {method}, Headers: {headers}, Payload: {payload}")
            
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
            print(f"Creator IQ API response status: {response.status_code}")
            
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
                    print(f"Creator IQ API error response: {error_data}")
                except:
                    error_message = f"API error: {e.response.status_code} {e.response.reason}"
            
            print(f"Creator IQ API error: {error_message}")
            raise ValueError(f"Creator IQ API error: {error_message}")

