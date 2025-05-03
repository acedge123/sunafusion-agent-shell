
"""
Re-export CreatorIQProvider from the new modular structure.
This file is maintained for backward compatibility.
"""

from agent.tools.data_providers.creator_iq import CreatorIQProvider

# Re-export the provider class
__all__ = ["CreatorIQProvider"]
