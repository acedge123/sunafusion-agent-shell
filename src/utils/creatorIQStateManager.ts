
import { supabase } from "@/integrations/supabase/client";

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

// Generate a unique state key based on user ID and query
export const generateStateKey = (userId: string, query: string): string => {
  return `ciq_${userId}_${query.replace(/\s+/g, '_').toLowerCase().substring(0, 20)}_${Date.now()}`;
};

// Save state data to session storage for immediate access
// This is useful for operations within the same session/conversation
export const saveStateToSessionStorage = (key: string, data: any): void => {
  try {
    const stateData = {
      key,
      data,
      timestamp: Date.now()
    };
    sessionStorage.setItem(`ciq_state_${key}`, JSON.stringify(stateData));
    console.log(`State saved to session storage with key: ${key}`);
  } catch (error) {
    console.error("Error saving state to session storage:", error);
  }
};

// Get state data from session storage
export const getStateFromSessionStorage = (key: string): any => {
  try {
    const stateData = sessionStorage.getItem(`ciq_state_${key}`);
    if (!stateData) {
      return null;
    }
    return JSON.parse(stateData).data;
  } catch (error) {
    console.error("Error getting state from session storage:", error);
    return null;
  }
};

// Save state data to database for persistent access across sessions
export const saveStateToDatabase = async (
  userId: string,
  key: string,
  data: any,
  expiryMinutes: number = 60
): Promise<boolean> => {
  try {
    // Calculate expiry time
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    
    const { error } = await supabase
      .from('creator_iq_state')
      .upsert({
        key,
        user_id: userId,
        data,
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'key'
      });

    if (error) {
      console.error("Error saving state to database:", error);
      return false;
    }
    console.log(`State saved to database with key: ${key}`);
    return true;
  } catch (error) {
    console.error("Error in saveStateToDatabase:", error);
    return false;
  }
};

// Get state data from database
export const getStateFromDatabase = async (
  userId: string,
  key: string
): Promise<any> => {
  try {
    // Get state data
    const { data, error } = await supabase
      .from('creator_iq_state')
      .select('data')
      .eq('user_id', userId)
      .eq('key', key)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error("Error retrieving state from database:", error);
      return null;
    }

    if (!data) {
      console.log(`No valid state found for key: ${key}`);
      return null;
    }

    return data.data;
  } catch (error) {
    console.error("Error in getStateFromDatabase:", error);
    return null;
  }
};

// Find state by query content - useful for follow-up questions
export const findStateByQuery = async (
  userId: string,
  queryParts: string[]
): Promise<any> => {
  try {
    // Get all state data for the user
    const { data, error } = await supabase
      .from('creator_iq_state')
      .select('key, data')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error retrieving state from database:", error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('No state data found for user');
      return null;
    }

    // Search for state that matches the query
    // This is a simple implementation - in practice, you might want to use
    // more sophisticated matching logic
    for (const state of data) {
      const stateString = JSON.stringify(state.data).toLowerCase();
      // Check if all query parts are in the state
      const isMatch = queryParts.every(part => 
        stateString.includes(part.toLowerCase())
      );
      
      if (isMatch) {
        console.log(`Found matching state: ${state.key}`);
        return state.data;
      }
    }

    console.log('No matching state found');
    return null;
  } catch (error) {
    console.error("Error in findStateByQuery:", error);
    return null;
  }
};

// Extract campaign data from Creator IQ API response
export const extractCampaignData = (responseData: any): CampaignData[] => {
  if (!responseData || !responseData.CampaignCollection) {
    return [];
  }

  return responseData.CampaignCollection.map((item: any) => {
    if (!item.Campaign) return null;
    
    return {
      id: item.Campaign.CampaignId,
      name: item.Campaign.CampaignName || 'Unnamed Campaign',
      status: item.Campaign.CampaignStatus,
      publishersCount: item.Campaign.PublishersCount
    };
  }).filter(Boolean);
};

// Extract publisher data from Creator IQ API response
export const extractPublisherData = (responseData: any): PublisherData[] => {
  if (!responseData || !responseData.PublisherCollection) {
    return [];
  }

  return responseData.PublisherCollection.map((item: any) => {
    if (!item.Publisher) return null;
    
    return {
      id: item.Publisher.Id,
      name: item.Publisher.PublisherName || 'Unnamed Publisher',
      status: item.Publisher.Status
    };
  }).filter(Boolean);
};

// Extract list data from Creator IQ API response
export const extractListData = (responseData: any): ListData[] => {
  if (!responseData || !responseData.ListsCollection) {
    return [];
  }

  return responseData.ListsCollection.map((item: any) => {
    if (!item.List) return null;
    
    return {
      id: item.List.Id,
      name: item.List.Name || 'Unnamed List',
      publishersCount: item.List.Publishers?.length
    };
  }).filter(Boolean);
};
