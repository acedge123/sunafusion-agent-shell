
"""
Search utilities for the Creator IQ API.
Contains functions to search for entities by name and retrieve related data.
"""

from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class CreatorIQSearch:
    """
    Search utilities for the Creator IQ API.
    """
    def __init__(self, api_caller):
        """
        Initialize the search utilities with the API caller function.
        
        Args:
            api_caller: Function to call the Creator IQ API endpoints
        """
        self.call_endpoint = api_caller

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
            
            # Log the search request
            logger.info(f"Searching for {entity_type} with name: '{name}'")
            
            # Call the endpoint to search entities
            response = self.call_endpoint(entity_type, search_payload)
            
            # Extract response data
            if not response or 'data' not in response:
                logger.info(f"No data returned from {entity_type} search for '{name}'")
                return None
                
            items = response.get('data', [])
            total = response.get('meta', {}).get('total', 0)
            
            logger.info(f"Found {total} {entity_type} matching search for '{name}'")
            
            if not items or total == 0:
                logger.info(f"No {entity_type} found matching '{name}'")
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
                    logger.info(f"Found exact match for {entity_type} '{name}': ID {item.get('id')}")
                    return {"id": item.get('id'), "details": item}
            
            # If no exact match, return the first item as best match
            first_match = items[0]
            if entity_type == 'lists':
                item_name = first_match.get('name', '')
            elif entity_type == 'campaigns':
                item_name = first_match.get('name', '')
            elif entity_type == 'publishers':
                item_name = first_match.get('name', '') or f"{first_match.get('first_name', '')} {first_match.get('last_name', '')}".strip()
            
            logger.info(f"No exact match found, using best match for {entity_type}: '{item_name}' with ID {first_match.get('id')}")
            return {"id": first_match.get('id'), "details": first_match}
            
        except Exception as e:
            logger.error(f"Error searching for {entity_type} by name '{name}': {str(e)}")
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
        logger.info(f"Starting two-step process to get publishers in list '{list_name}'")
        
        # Step 1: Find the list by name
        list_data = self.find_by_name('lists', list_name)
        if not list_data or 'id' not in list_data:
            logger.warning(f"Could not find list with name '{list_name}'")
            return {"error": f"Could not find list with name '{list_name}'"}
        
        list_id = list_data["id"]
        list_details = list_data["details"]
        logger.info(f"Found list '{list_name}' with ID: {list_id}")
        
        # Step 2: Get publishers in the list
        try:
            payload = {
                "list_id": list_id,
                "limit": 50  # Fetch up to 50 publishers
            }
            logger.info(f"Retrieving publishers for list ID: {list_id}")
            publishers_response = self.call_endpoint("list_publishers", payload)
            
            publishers_count = len(publishers_response.get("data", []))
            logger.info(f"Retrieved {publishers_count} publishers from list '{list_name}'")
            
            # Prepare a comprehensive response with list details and publishers
            return {
                "list": list_details,
                "publishers": publishers_response.get("data", []),
                "total_publishers": publishers_response.get("meta", {}).get("total", 0),
                "list_id": list_id
            }
        except Exception as e:
            error_msg = f"Error getting publishers for list '{list_name}' (ID: {list_id}): {str(e)}"
            logger.error(error_msg)
            return {
                "error": error_msg,
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
        logger.info(f"Starting two-step process to get publishers in campaign '{campaign_name}'")
        
        # Step 1: Find the campaign by name
        campaign_data = self.find_by_name('campaigns', campaign_name)
        if not campaign_data or 'id' not in campaign_data:
            logger.warning(f"Could not find campaign with name '{campaign_name}'")
            return {"error": f"Could not find campaign with name '{campaign_name}'"}
        
        campaign_id = campaign_data["id"]
        campaign_details = campaign_data["details"]
        logger.info(f"Found campaign '{campaign_name}' with ID: {campaign_id}")
        
        # Step 2: Get publishers in the campaign
        try:
            payload = {
                "campaign_id": campaign_id,
                "limit": 50  # Fetch up to 50 publishers
            }
            logger.info(f"Retrieving publishers for campaign ID: {campaign_id}")
            publishers_response = self.call_endpoint("campaign_publishers", payload)
            
            publishers_count = len(publishers_response.get("data", []))
            logger.info(f"Retrieved {publishers_count} publishers from campaign '{campaign_name}'")
            
            # Prepare a comprehensive response
            return {
                "campaign": campaign_details,
                "publishers": publishers_response.get("data", []),
                "total_publishers": publishers_response.get("meta", {}).get("total", 0),
                "campaign_id": campaign_id
            }
        except Exception as e:
            error_msg = f"Error getting publishers for campaign '{campaign_name}' (ID: {campaign_id}): {str(e)}"
            logger.error(error_msg)
            return {
                "error": error_msg,
                "campaign_id": campaign_id,
                "campaign": campaign_details
            }
