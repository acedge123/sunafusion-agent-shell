
// Type definitions for endpoint determination

// Endpoint definition structure
export interface CreatorIQEndpoint {
  route: string;
  method: string;
  name: string;
  sourceListId?: string;
  targetListId?: string;
  sourceId?: string;
  sourceType?: string;
  targetCampaignId?: string;
  sourceCampaignId?: string;
  publisherId?: string;
}

// Previous state structure for context
export interface PreviousState {
  lists?: Array<{
    id: string;
    name: string;
  }>;
  campaigns?: Array<{
    id: string;
    name: string;
  }>;
  publishers?: Array<{
    id: string;
    name: string;
    status?: string;
  }>;
}
