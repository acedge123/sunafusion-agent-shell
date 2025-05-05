
import { cacheCore } from './cacheCore';
import { campaignCache } from './campaignCache';
import { listCache } from './listCache';
import { publisherCache } from './publisherCache';
import { operationsCache } from './operationsCache';

// Combine all cache functionality
export const creatorIQCache = {
  // Core cache operations
  set: cacheCore.set,
  get: cacheCore.get,
  flush: cacheCore.flush,
  
  // Campaign operations
  storeAllCampaigns: campaignCache.storeAllCampaigns,
  getAllCampaigns: campaignCache.getAllCampaigns,
  findCampaignByName: campaignCache.findCampaignByName,
  
  // List operations
  storeAllLists: listCache.storeAllLists,
  getAllLists: listCache.getAllLists,
  findListById: listCache.findListById,
  findListByName: listCache.findListByName,
  
  // Publisher operations
  storeAllPublishers: publisherCache.storeAllPublishers,
  getAllPublishers: publisherCache.getAllPublishers,
  findPublisherById: publisherCache.findPublisherById,
  findPublisherByName: publisherCache.findPublisherByName,
  
  // Operation results
  storeOperationResult: operationsCache.storeOperationResult,
  getOperationResults: operationsCache.getOperationResults
};
