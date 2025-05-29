
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ProductFeed {
  id: string;
  feed_name: string;
  feed_data: any;
  company_id: string;
  companies: {
    name: string;
  };
}

export async function searchProductFeeds(
  query: string,
  authToken?: string
): Promise<{ source: string; results: any[]; error?: string }> {
  console.log('Searching product feeds for query:', query);
  
  if (!authToken) {
    return {
      source: 'product_feeds',
      results: [],
      error: 'Authentication required to access product feeds'
    };
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration not found');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth token
    const { data: { user }, error: userError } = await supabase.auth.getUser(authToken);
    
    if (userError || !user) {
      return {
        source: 'product_feeds',
        results: [],
        error: 'Invalid authentication token'
      };
    }

    // Fetch product feeds for the authenticated user
    const { data: feeds, error: feedsError } = await supabase
      .from('product_feeds')
      .select(`
        id,
        feed_name,
        feed_data,
        company_id,
        companies (
          name
        )
      `)
      .eq('user_id', user.id)
      .not('feed_data', 'is', null);

    if (feedsError) {
      console.error('Error fetching product feeds:', feedsError);
      return {
        source: 'product_feeds',
        results: [],
        error: 'Failed to fetch product feeds'
      };
    }

    if (!feeds || feeds.length === 0) {
      return {
        source: 'product_feeds',
        results: [],
        error: 'No product feeds found. Please upload some product feeds first.'
      };
    }

    // Search through all product data
    const searchResults: any[] = [];
    const queryLower = query.toLowerCase();
    
    for (const feed of feeds as ProductFeed[]) {
      if (!feed.feed_data) continue;
      
      const feedResults = {
        feed_name: feed.feed_name,
        company_name: feed.companies?.name || 'Unknown Company',
        products: [] as any[]
      };

      // Search through products in the feed
      if (Array.isArray(feed.feed_data)) {
        // Handle array of products
        for (const product of feed.feed_data) {
          if (productMatchesQuery(product, queryLower)) {
            feedResults.products.push(product);
          }
        }
      } else if (feed.feed_data.products && Array.isArray(feed.feed_data.products)) {
        // Handle nested products array
        for (const product of feed.feed_data.products) {
          if (productMatchesQuery(product, queryLower)) {
            feedResults.products.push(product);
          }
        }
      } else if (typeof feed.feed_data === 'object') {
        // Handle single product object
        if (productMatchesQuery(feed.feed_data, queryLower)) {
          feedResults.products.push(feed.feed_data);
        }
      }

      // Only include feeds that have matching products
      if (feedResults.products.length > 0) {
        searchResults.push(feedResults);
      }
    }

    console.log(`Found ${searchResults.length} feeds with matching products`);
    
    return {
      source: 'product_feeds',
      results: searchResults
    };

  } catch (error) {
    console.error('Error in searchProductFeeds:', error);
    return {
      source: 'product_feeds',
      results: [],
      error: `Product feed search error: ${error.message}`
    };
  }
}

function productMatchesQuery(product: any, queryLower: string): boolean {
  if (!product || typeof product !== 'object') return false;
  
  // Search in common product fields
  const searchableFields = [
    'title', 'name', 'description', 'brand', 'category', 'type',
    'sku', 'id', 'product_id', 'product_type', 'vendor', 'tags'
  ];
  
  for (const field of searchableFields) {
    const value = product[field];
    if (typeof value === 'string' && value.toLowerCase().includes(queryLower)) {
      return true;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string' && item.toLowerCase().includes(queryLower)) {
          return true;
        }
      }
    }
  }
  
  // Also search in any other string fields
  for (const [key, value] of Object.entries(product)) {
    if (typeof value === 'string' && value.toLowerCase().includes(queryLower)) {
      return true;
    }
  }
  
  return false;
}
