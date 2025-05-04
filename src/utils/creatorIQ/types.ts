
// Define types for our state data
export interface CreatorIQState {
  key: string;
  userId: string;
  data: any;
  expiresAt: Date;
  createdAt: Date;
}

// Define types for the different entities we might store
export interface CampaignData {
  id: string;
  name: string;
  status?: string;
  publishersCount?: number;
}

export interface PublisherData {
  id: string;
  name: string;
  status?: string;
}

export interface ListData {
  id: string;
  name: string;
  publishersCount?: number;
}

// Define the structure of the creator_iq_state table for TypeScript
export interface CreatorIQStateRow {
  id: string;
  key: string;
  user_id: string;
  data: any;
  query_context: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}
