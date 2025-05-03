
"""
Provider for the Creator IQ API.
Main class that integrates with the agent system.
"""

from agent.tools.data_providers.RapidDataProviderBase import RapidDataProviderBase
from .api_client import CreatorIQClient
from .search import CreatorIQSearch
from .endpoints import CREATOR_IQ_ENDPOINTS
import logging

logger = logging.getLogger(__name__)

class CreatorIQProvider(RapidDataProviderBase):
    """
    Provider for Creator IQ API - a CRM system for managing Influencer/Creator relationships.
    """
    
    def __init__(self):
        # Initialize with the correct base URL and endpoints
        super().__init__(
            base_url="https://apis.creatoriq.com/crm/v1/api",
            endpoints=CREATOR_IQ_ENDPOINTS
        )
        
        logger.info("Initializing Creator IQ Provider")
        
        # Initialize API client and search utilities
        self.api_client = CreatorIQClient(self.base_url)
        self.search_utils = CreatorIQSearch(self.call_endpoint)
    
    def find_by_name(self, entity_type, name):
        """
        Search for an entity by name.
        
        Args:
            entity_type: Type of entity to search for
            name: Name to search for
            
        Returns:
            Entity details if found
        """
        logger.info(f"Finding {entity_type} by name: {name}")
        return self.search_utils.find_by_name(entity_type, name)
    
    def get_publishers_in_list(self, list_name):
        """
        Get publishers in a list.
        
        Args:
            list_name: Name of the list
            
        Returns:
            Publishers in the list
        """
        logger.info(f"Getting publishers in list: {list_name}")
        return self.search_utils.get_publishers_in_list(list_name)
    
    def get_publishers_in_campaign(self, campaign_name):
        """
        Get publishers in a campaign.
        
        Args:
            campaign_name: Name of the campaign
            
        Returns:
            Publishers in the campaign
        """
        logger.info(f"Getting publishers in campaign: {campaign_name}")
        return self.search_utils.get_publishers_in_campaign(campaign_name)
    
    def call_endpoint(self, route, payload=None):
        """
        Call an API endpoint.
        
        Args:
            route: Endpoint route key
            payload: Request parameters
            
        Returns:
            API response
        """
        try:
            # Get the endpoint configuration
            endpoint = self.endpoints.get(route)
            if not endpoint:
                raise ValueError(f"Endpoint {route} not found in Creator IQ provider")
            
            # Get route and method from endpoint config
            api_route = endpoint["route"]
            method = endpoint.get("method", "GET").upper()
            
            logger.info(f"Calling Creator IQ endpoint {route} with payload: {payload}")
            
            # Call the API using the client
            return self.api_client.call_api(api_route, method, payload)
            
        except Exception as e:
            logger.error(f"Error calling Creator IQ endpoint {route}: {str(e)}")
            raise
