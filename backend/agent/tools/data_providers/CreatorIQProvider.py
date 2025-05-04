
import os
import requests
from typing import Dict, Any, Optional, List
from agent.tools.data_providers.RapidDataProviderBase import RapidDataProviderBase, EndpointSchema

class CreatorIQProvider(RapidDataProviderBase):
    """
    Provider for Creator IQ API - a CRM system for managing Influencer/Creator relationships.
    """
    
    def __init__(self):
        # Define available endpoints with both read and write operations
        endpoints = {
            # Read operations (GET)
            "publishers": {
                "route": "/publishers",
                "method": "GET",
                "name": "List Publishers",
                "description": "Get a list of publishers/influencers",
                "payload": {
                    "limit": "Number of results to return (default: 10)",
                    "offset": "Starting position for pagination",
                    "status": "Filter by publisher status (e.g., active, inactive)",
                    "search": "Search term to filter publishers by name or other details",
                    "page": "Page number for pagination (starts at 1)"
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
                    "search": "Search term to filter campaigns by name",
                    "page": "Page number for pagination (starts at 1)"
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
                "description": "Get publishers associated with a specific campaign",
                "payload": {
                    "campaign_id": "ID of the campaign",
                    "limit": "Number of results to return (default: 10)",
                    "offset": "Starting position for pagination",
                    "page": "Page number for pagination (starts at 1)"
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
                    "content_type": "Filter by content type (e.g., post, video, story)",
                    "page": "Page number for pagination (starts at 1)"
                }
            },
            "lists": {
                "route": "/lists",
                "method": "GET",
                "name": "Get Lists",
                "description": "Get a list of all publisher lists",
                "payload": {
                    "limit": "Number of results to return (default: 50)",
                    "offset": "Starting position for pagination",
                    "search": "Search term to filter lists by name or other details",
                    "status": "Filter by list status",
                    "page": "Page number for pagination (starts at 1)"
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
                    "offset": "Starting position for pagination",
                    "page": "Page number for pagination (starts at 1)"
                }
            },
            
            # Write operations
            "create_list": {
                "route": "/lists",
                "method": "POST",
                "name": "Create List",
                "description": "Create a new publisher list",
                "payload": {
                    "Name": "Name of the list (required)",
                    "Description": "Description of the list (optional)"
                }
            },
            "update_list": {
                "route": "/lists/{list_id}",
                "method": "PUT",
                "name": "Update List", 
                "description": "Update an existing list",
                "payload": {
                    "list_id": "ID of the list to update",
                    "Name": "Updated name of the list (optional)",
                    "Description": "Updated description of the list (optional)"
                }
            },
            "add_publisher_to_list": {
                "route": "/lists/{list_id}/publishers",
                "method": "POST",
                "name": "Add Publisher to List",
                "description": "Add one or more publishers to a list",
                "payload": {
                    "list_id": "ID of the list",
                    "PublisherIds": "Array of publisher IDs to add to the list"
                }
            },
            "update_publisher": {
                "route": "/publishers/{publisher_id}",
                "method": "PUT",
                "name": "Update Publisher",
                "description": "Update publisher information",
                "payload": {
                    "publisher_id": "ID of the publisher to update",
                    "Status": "Publisher status (active, inactive, pending, invited)"
                }
            },
            "create_campaign": {
                "route": "/campaigns", 
                "method": "POST",
                "name": "Create Campaign",
                "description": "Create a new campaign",
                "payload": {
                    "CampaignName": "Name of the campaign (required)",
                    "Description": "Description of the campaign (optional)",
                    "StartDate": "Campaign start date (YYYY-MM-DD)",
                    "EndDate": "Campaign end date (YYYY-MM-DD)"
                }
            },
            "add_publisher_to_campaign": {
                "route": "/campaigns/{campaign_id}/publishers",
                "method": "POST",
                "name": "Add Publisher to Campaign",
                "description": "Add one or more publishers to a campaign",
                "payload": {
                    "campaign_id": "ID of the campaign",
                    "PublisherIds": "Array of publisher IDs to add to the campaign"
                }
            },
            "send_message": {
                "route": "/publishers/{publisher_id}/messages",
                "method": "POST",
                "name": "Send Message to Publisher",
                "description": "Send a message to a specific publisher",
                "payload": {
                    "publisher_id": "ID of the publisher to message",
                    "Content": "Message content (required)",
                    "Subject": "Message subject line (optional)"
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
            
            # Log the request details
            print(f"Making Creator IQ API request to: {url}")
            print(f"Method: {method}")
            print(f"Headers: {headers}")
            print(f"Payload: {payload}")

            # Special handling for pagination in requests
            if method == "GET" and payload and "page" in payload:
                # Convert page to offset for API that expects offset-based pagination
                if "limit" in payload:
                    limit = int(payload.get("limit", 50))
                else:
                    limit = 50
                    payload["limit"] = limit
                
                page = int(payload["page"])
                offset = (page - 1) * limit
                payload["offset"] = offset
                
                # Remove page parameter as API uses offset
                payload = {k: v for k, v in payload.items() if k != "page"}
                print(f"Converted page {page} to offset {offset} with limit {limit}")
            
            # Special handling for search operations
            if method == "GET":
                if route == "lists" and payload and "search" in payload:
                    search_term = payload["search"]
                    print(f"Searching for lists with term: {search_term}")
                    
                    # First make the request without the search parameter to get all lists
                    search_payload = {k: v for k, v in payload.items() if k != "search"}
                    
                    # Increase the limit to get more potential matches
                    if "limit" not in search_payload:
                        search_payload["limit"] = 50
                    
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
                    
                    # Process the response to filter by list name
                    if "ListsCollection" in full_response:
                        # Filter lists by name containing the search term (case-insensitive)
                        original_lists = full_response["ListsCollection"]
                        print(f"Found {len(original_lists)} lists before filtering")
                        
                        # Enhanced debugging for list structure
                        if len(original_lists) > 0:
                            sample_list = original_lists[0]
                            print(f"Sample list structure: {str(sample_list.keys())}")
                            if "List" in sample_list:
                                list_keys = sample_list["List"].keys()
                                print(f"List details keys: {str(list_keys)}")
                                if "Name" in sample_list["List"]:
                                    print(f"List name example: {sample_list['List']['Name']}")
                        
                        filtered_lists = []
                        for list_item in original_lists:
                            if "List" in list_item and "Name" in list_item["List"]:
                                list_name = list_item["List"]["Name"].lower()
                                if search_term.lower() in list_name:
                                    print(f"Match found: '{list_name}' matches '{search_term}'")
                                    filtered_lists.append(list_item)
                    
                    # Update the response with filtered results
                    full_response["ListsCollection"] = filtered_lists
                    full_response["count"] = len(filtered_lists)
                    full_response["filtered_by"] = search_term
                    full_response["total"] = len(filtered_lists)  # Update total to reflect filtered count
                    
                    print(f"Found {len(filtered_lists)} lists matching '{search_term}'")
                    
                    return full_response
                
                elif route == "campaigns" and payload and "search" in payload:
                    search_term = payload["search"]
                    print(f"Searching for campaigns with term: {search_term}")
                    
                    # First make the request without the search parameter to get all campaigns
                    search_payload = {k: v for k, v in payload.items() if k != "search"}
                    
                    # Increase the limit to get more potential matches
                    if "limit" not in search_payload:
                        search_payload["limit"] = 50
                    
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
                                campaign_keys = sample_campaign["Campaign"].keys()
                                print(f"Campaign details keys: {str(campaign_keys)}")
                                if "CampaignName" in sample_campaign["Campaign"]:
                                    print(f"Campaign name example: {sample_campaign['Campaign']['CampaignName']}")
                        
                        filtered_campaigns = []
                        for campaign in original_campaigns:
                            if "Campaign" in campaign and "CampaignName" in campaign["Campaign"]:
                                campaign_name = campaign["Campaign"]["CampaignName"].lower()
                                if search_term.lower() in campaign_name:
                                    print(f"Match found: '{campaign_name}' matches '{search_term}'")
                                    filtered_campaigns.append(campaign)
                    
                    # Update the response with filtered results
                    full_response["CampaignCollection"] = filtered_campaigns
                    full_response["count"] = len(filtered_campaigns)
                    full_response["filtered_by"] = search_term
                    full_response["total"] = len(filtered_campaigns)  # Update total to reflect filtered count
                    
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
            
            # Make the request based on the HTTP method
            if method == "GET":
                response = requests.get(url, params=payload, headers=headers)
            elif method == "POST":
                # For POST requests, send the payload in the request body
                response = requests.post(url, json=payload, headers=headers)
            elif method == "PUT":
                # For PUT requests, send the payload in the request body
                response = requests.put(url, json=payload, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            # Check for errors
            response.raise_for_status()
            
            # Log response status
            print(f"Creator IQ API response status: {response.status_code}")
            
            # Parse and return the response data
            response_data = response.json()
            
            # Additional handling for specific response types
            if method in ["POST", "PUT"]:
                # For write operations, add metadata about what was done
                operation_type = endpoint["name"]
                print(f"Successfully executed {operation_type}")
                
                response_data["operation"] = {
                    "type": operation_type,
                    "method": method,
                    "successful": True,
                    "timestamp": import_time_module_and_get_iso_time()
                }
                
                # Add specific details based on operation type
                if "Create List" in operation_type and payload and "Name" in payload:
                    response_data["operation"]["details"] = f"Created list: {payload['Name']}"
                elif "Update List" in operation_type:
                    response_data["operation"]["details"] = f"Updated list: {formatted_route.split('/')[-1]}"
                elif "Add Publisher" in operation_type:
                    response_data["operation"]["details"] = f"Added publishers to {route.split('_')[0]}"
                elif "Send Message" in operation_type:
                    response_data["operation"]["details"] = "Message sent successfully"
            
            # Add pagination information to response
            if method == "GET":
                # For lists endpoint, ensure pagination info is included
                if route == "lists" and "ListsCollection" in response_data:
                    # If limit is in the payload, use it, otherwise default to 50
                    limit = int(payload.get("limit", 50)) if payload else 50
                    offset = int(payload.get("offset", 0)) if payload else 0
                    page = (offset // limit) + 1
                    
                    # Get total item count
                    total_items = response_data.get("count") or len(response_data.get("ListsCollection", []))
                    
                    # Calculate total pages
                    total_pages = (total_items + limit - 1) // limit if total_items > 0 else 1
                    
                    # Add pagination metadata to response
                    response_data["page"] = page
                    response_data["limit"] = limit
                    response_data["offset"] = offset
                    response_data["total"] = total_items
                    response_data["total_pages"] = total_pages
                    
                    print(f"List pagination: page {page} of {total_pages}, {total_items} total items")
                
                # For campaigns endpoint, ensure pagination info is included
                elif route == "campaigns" and "CampaignCollection" in response_data:
                    # If limit is in the payload, use it, otherwise default to 50
                    limit = int(payload.get("limit", 50)) if payload else 50
                    offset = int(payload.get("offset", 0)) if payload else 0
                    page = (offset // limit) + 1
                    
                    # Get total item count
                    total_items = response_data.get("count") or len(response_data.get("CampaignCollection", []))
                    
                    # Calculate total pages
                    total_pages = (total_items + limit - 1) // limit if total_items > 0 else 1
                    
                    # Add pagination metadata to response
                    response_data["page"] = page
                    response_data["limit"] = limit
                    response_data["offset"] = offset
                    response_data["total"] = total_items
                    response_data["total_pages"] = total_pages
            
            # Additional logging for GET operations
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
                    
                # Get campaign details including publisher counts for all campaigns
                for campaign in campaigns:
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
                            
            # Handle list response data similarly to campaigns
            if route == "lists" and "ListsCollection" in response_data:
                lists = response_data["ListsCollection"]
                list_names = []
                for l in lists:
                    if 'List' in l and 'Name' in l['List']:
                        list_id = l['List'].get('Id', 'Unknown')
                        list_name = l['List'].get('Name', 'Unnamed')
                        list_names.append(f"{list_id}: {list_name}")
                
                print(f"Retrieved {len(lists)} lists:")
                for idx, name in enumerate(list_names[:5]):
                    print(f"  {idx+1}. {name}")
                    
                if len(lists) > 5:
                    print(f"... and {len(lists) - 5} more")
                    
                # Add pagination metadata for lists
                limit = int(payload.get("limit", 50)) if payload else 50
                offset = int(payload.get("offset", 0)) if payload else 0
                page = (offset // limit) + 1
                
                # Get total item count from response or use the number of lists we have
                total_items = response_data.get("total") or response_data.get("count") or len(lists)
                
                # Calculate total pages
                total_pages = (total_items + limit - 1) // limit if total_items > 0 else 1
                
                # Update response with pagination metadata
                response_data["page"] = page
                response_data["limit"] = limit
                response_data["offset"] = offset
                response_data["total"] = total_items
                response_data["total_pages"] = total_pages
                
                print(f"List pagination: page {page} of {total_pages}, {total_items} total items")
                    
                # Get list details including publisher counts for all lists
                for list_item in lists:
                    if "List" in list_item and "Id" in list_item["List"]:
                        list_id = list_item["List"]["Id"]
                        try:
                            # Get the count of publishers for this list
                            publishers_url = f"{self.base_url}/lists/{list_id}/publishers"
                            publishers_response = requests.get(publishers_url, headers=headers)
                            
                            if publishers_response.ok:
                                publishers_data = publishers_response.json()
                                publisher_count = publishers_data.get("count", 0)
                                # Add this information to the list object
                                list_item["List"]["Publishers"] = publisher_count
                                print(f"List {list_id} has {publisher_count} publishers")
                            else:
                                print(f"Failed to get publishers for list {list_id}: {publishers_response.status_code}")
                                
                        except Exception as e:
                            print(f"Error getting publishers for list {list_id}: {str(e)}")
            
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

    # Add a new method to get all lists with pagination support
    def get_all_lists(self, page_size: int = 50, max_pages: int = 10) -> Dict[str, Any]:
        """
        Get all lists with pagination support
        
        Args:
            page_size: Number of lists per page
            max_pages: Maximum number of pages to fetch
            
        Returns:
            Combined response with all lists and metadata
        """
        try:
            all_lists = []
            total_items = 0
            total_pages = 1
            current_page = 1
            
            # Make first request to get total count
            first_page = self.call_endpoint("lists", {"limit": page_size, "page": 1})
            
            # Get pagination info
            if "total" in first_page:
                total_items = first_page["total"]
                total_pages = first_page["total_pages"]
                
                print(f"Found {total_items} total lists across {total_pages} pages")
            
            # Add first page of results
            if "ListsCollection" in first_page:
                all_lists.extend(first_page["ListsCollection"])
                
            # If we have more pages, fetch them
            pages_to_fetch = min(max_pages, total_pages) - 1  # -1 because we already fetched page 1
            
            for page in range(2, 2 + pages_to_fetch):
                print(f"Fetching lists page {page} of {total_pages}")
                page_result = self.call_endpoint("lists", {"limit": page_size, "page": page})
                
                if "ListsCollection" in page_result:
                    all_lists.extend(page_result["ListsCollection"])
            
            # Update the first page response with combined results
            first_page["ListsCollection"] = all_lists
            first_page["pages_searched"] = min(max_pages, total_pages)
            first_page["searched_all_pages"] = (min(max_pages, total_pages) == total_pages)
            first_page["items_found"] = len(all_lists)
            
            print(f"Retrieved {len(all_lists)} lists from {min(max_pages, total_pages)} pages")
            
            return first_page
            
        except Exception as e:
            print(f"Error fetching all lists: {str(e)}")
            return {"ListsCollection": [], "error": str(e)}
    
    # Helper functions for specific operations
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
            
    def search_lists_by_name(self, search_term: str) -> List[Dict[str, Any]]:
        """
        Helper method to specifically search for lists by name
        
        Args:
            search_term: The list name or partial name to search for
            
        Returns:
            List of matching lists with details
        """
        print(f"Searching for lists with name containing: {search_term}")
        
        try:
            # Add a higher limit to get more lists
            response = self.call_endpoint("lists", {"limit": 50, "search": search_term})
            
            if "ListsCollection" in response:
                return response["ListsCollection"]
            return []
        except Exception as e:
            print(f"Error in search_lists_by_name: {e}")
            return []

    def create_list(self, name: str, description: str = None) -> Dict[str, Any]:
        """
        Helper method to create a new publisher list
        
        Args:
            name: Name of the list to create
            description: Optional description of the list
            
        Returns:
            Response data from the API including the new list ID
        """
        payload = {
            "Name": name
        }
        
        if description:
            payload["Description"] = description
            
        print(f"Creating new list: {name}")
        return self.call_endpoint("create_list", payload)
    
    def add_publishers_to_list(self, list_id: str, publisher_ids: List[str]) -> Dict[str, Any]:
        """
        Helper method to add publishers to a list
        
        Args:
            list_id: ID of the list to add publishers to
            publisher_ids: List of publisher IDs to add
            
        Returns:
            Response data from the API
        """
        payload = {
            "list_id": list_id,
            "PublisherIds": publisher_ids
        }
        
        print(f"Adding {len(publisher_ids)} publishers to list {list_id}")
        return self.call_endpoint("add_publisher_to_list", payload)
    
    def update_publisher_status(self, publisher_id: str, status: str) -> Dict[str, Any]:
        """
        Helper method to update a publisher's status
        
        Args:
            publisher_id: ID of the publisher to update
            status: New status (active, inactive, pending, invited)
            
        Returns:
            Response data from the API
        """
        payload = {
            "publisher_id": publisher_id,
            "Status": status
        }
        
        print(f"Updating publisher {publisher_id} status to {status}")
        return self.call_endpoint("update_publisher", payload)
    
    def send_message_to_publisher(self, publisher_id: str, content: str, subject: str = None) -> Dict[str, Any]:
        """
        Helper method to send a message to a publisher
        
        Args:
            publisher_id: ID of the publisher to message
            content: Message content
            subject: Optional message subject
            
        Returns:
            Response data from the API
        """
        payload = {
            "publisher_id": publisher_id,
            "Content": content
        }
        
        if subject:
            payload["Subject"] = subject
            
        print(f"Sending message to publisher {publisher_id}")
        return self.call_endpoint("send_message", payload)

# Helper to get ISO formatted time without importing time module at the top level
def import_time_module_and_get_iso_time():
    from datetime import datetime
    return datetime.now().isoformat()
