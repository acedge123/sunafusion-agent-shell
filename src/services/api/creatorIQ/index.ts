
// Re-export all functions from the service files
import { processCreatorIQResponse, makeCreatorIQRequest } from './serviceBase';
import { fetchListsByPage, searchListsByName, getListPublishers } from './listsService';
import { fetchPublishersByPage, searchPublishersByName } from './publishersService';
import { getCampaignPublishers } from './campaignsService';

// Export for named imports
export { processCreatorIQResponse, makeCreatorIQRequest } from './serviceBase';
export { fetchListsByPage, searchListsByName, getListPublishers } from './listsService';
export { fetchPublishersByPage, searchPublishersByName } from './publishersService';
export { getCampaignPublishers } from './campaignsService';

// Export everything by default as well
export default {
  processCreatorIQResponse,
  makeCreatorIQRequest,
  fetchListsByPage,
  searchListsByName,
  getListPublishers,
  fetchPublishersByPage,
  searchPublishersByName,
  getCampaignPublishers
};
