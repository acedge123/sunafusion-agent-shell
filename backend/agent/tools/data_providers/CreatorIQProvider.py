
import os
import requests
from typing import Dict, Any, Optional, List
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
            # Lists endpoints
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
                    "limit": "Number of results to return (default: 10)",
                    "offset": "Starting position for pagination"
                }
            }
        }
        
        # Initialize with the correct base URL and endpoints
        super().__init__(
            base_url="https://apis.creatoriq.com/crm/v1/api",  # Updated base URL
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
            
            # Handle search parameter for campaigns specially
            if route == "campaigns" and payload and "search" in payload:
                search_term = payload["search"]
                print(f"Searching for campaigns with term: {search_term}")
                
                # First make the request without the search parameter to get all campaigns
                search_payload = {k: v for k, v in payload.items() if k != "search"}
                
                if method == "GET":
                    response = requests.get(url, params=search_payload, headers=headers)
                else:
                    response = requests.post(url, json=search_payload, headers=headers)
                
                # Check for errors
                response.raise_for_status()
                
                # Get the response data
                full_response = response.json()
                
                # Log the raw response for debugging
                print(f"Raw API response structure: {str(full_response.keys())}")
                
                # Process the response to filter by campaign name
                if "CampaignCollection" in full_response:
                    # Filter campaigns by name containing the search term (case-insensitive)
                    original_campaigns = full_response["CampaignCollection"]
                    print(f"Found {len(original_campaigns)} campaigns before filtering")
                    
                    # Enhanced debugging for campaign structure
                    if len(original_campaigns) > 0:
                        sample_campaign = original_campaigns[0]
                        print(f"Sample campaign structure: {str(sample_campaign.keys())}")
                        if "Campaign" in sample_campaign:
                            print(f"Campaign details: {str(sample_campaign['Campaign'].keys())}")
                    
                    filtered_campaigns = []
                    for campaign in original_campaigns:
                        if "Campaign" in campaign:
                            campaign_name = campaign["Campaign"].get("CampaignName", "").lower()
                            if search_term.lower() in campaign_name:
                                print(f"Match found: '{campaign_name}' matches '{search_term}'")
                                filtered_campaigns.append(campaign)
                    
                    # Update the response with filtered results
                    full_response["CampaignCollection"] = filtered_campaigns
                    full_response["count"] = len(filtered_campaigns)
                    full_response["filtered_by"] = search_term
                    
                    print(f"Found {len(filtered_campaigns)} campaigns matching '{search_term}'")
                    
                    # Get campaign details including publisher counts
                    for campaign in filtered_campaigns:
                        if "Campaign" in campaign and "CampaignId" in campaign["Campaign"]:
                            campaign_id = campaign["Campaign"]["CampaignId"]
                            try:
                                # Get the count of publishers for this campaign
                                publishers_url = f"{self.base_url}/campaigns/{campaign_id}/publishers"
                                publishers_response = requests.get(publishers_url, headers=headers)
                                
                                if publishers_response.ok:
                                    publishers_data = publishers_response.json()
                                    publisher_count = publishers_data.get("count", 0)
                                    # Add this information to the campaign object
                                    campaign["Campaign"]["PublishersCount"] = publisher_count
                                    print(f"Campaign {campaign_id} has {publisher_count} publishers")
                                else:
                                    print(f"Failed to get publishers for campaign {campaign_id}: {publishers_response.status_code}")
                                    
                            except Exception as e:
                                print(f"Error getting publishers for campaign {campaign_id}: {str(e)}")
                    
                    return full_response
            
            # Make the regular request if not a special case
            print(f"Method: {method}, Headers: {headers}, Payload: {payload}")
            
            if method == "GET":
                response = requests.get(url, params=payload, headers=headers)
            elif method == "POST":
                response = requests.post(url, json=payload, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            # Check for errors
            response.raise_for_status()
            
            # Log response status and preview
            print(f"Creator IQ API response status: {response.status_code}")
            response_data = response.json()
            
            # If we have campaign data, let's log a bit more detail for debugging
            if route == "campaigns" and "CampaignCollection" in response_data:
                campaigns = response_data["CampaignCollection"]
                campaign_names = []
                for c in campaigns:
                    if 'Campaign' in c and 'CampaignName' in c['Campaign']:
                        campaign_id = c['Campaign'].get('CampaignId', 'Unknown')
                        campaign_name = c['Campaign'].get('CampaignName', 'Unnamed')
                        campaign_names.append(f"{campaign_id}: {campaign_name}")
                
                print(f"Retrieved {len(campaigns)} campaigns:")
                for idx, name in enumerate(campaign_names[:5]):
                    print(f"  {idx+1}. {name}")
                    
                if len(campaigns) > 5:
                    print(f"... and {len(campaigns) - 5} more")
            
            return response_data
            
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

    def search_campaigns_by_name(self, search_term: str) -> List[Dict[str, Any]]:
        """
        Helper method to specifically search for campaigns by name
        
        Args:
            search_term: The campaign name or partial name to search for
            
        Returns:
            List of matching campaigns with details
        """
        print(f"Searching for campaigns with name containing: {search_term}")
        
        try:
            # Add a higher limit to get more campaigns
            response = self.call_endpoint("campaigns", {"limit": 50, "search": search_term})
            
            if "CampaignCollection" in response:
                return response["CampaignCollection"]
            return []
        except Exception as e:
            print(f"Error in search_campaigns_by_name: {e}")
            return []
