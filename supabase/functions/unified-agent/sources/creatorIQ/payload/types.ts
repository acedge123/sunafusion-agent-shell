
// Type definitions for payload building
export interface PayloadParams {
  [key: string]: any;
}

export interface BuildPayloadOptions {
  query: string;
  params: PayloadParams;
  previousState?: any;
}

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
  [key: string]: any;
}
