
"""
Endpoint definitions for the Creator IQ API.
This file contains all the available endpoints and their schemas.
"""

# Define available endpoints for the Creator IQ API
CREATOR_IQ_ENDPOINTS = {
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
