
/**
 * Extract and log all available publisher IDs from a response or state
 * Useful for debugging and helping users find valid IDs
 */
export function logAvailablePublisherIds(data: any): void {
  try {
    const publishers: any[] = [];
    
    // Extract publishers from different data structures
    if (data.publishers && Array.isArray(data.publishers)) {
      publishers.push(...data.publishers);
    }
    
    if (data.results) {
      data.results.forEach((result: any) => {
        if (result.data && result.data.PublisherCollection) {
          const resultPublishers = Array.isArray(result.data.PublisherCollection) 
            ? result.data.PublisherCollection 
            : [];
          publishers.push(...resultPublishers);
        }
      });
    }
    
    if (publishers.length > 0) {
      console.log(`Found ${publishers.length} available publishers:`);
      
      // Extract and log IDs and names if available
      const publisherInfo = publishers.slice(0, 10).map(p => {
        if (p.id) return { id: p.id, name: p.name || 'Unknown' };
        if (p.Publisher && p.Publisher.Id) {
          return { 
            id: p.Publisher.Id, 
            name: p.Publisher.Name || p.Publisher.Username || 'Unknown'
          };
        }
        return null;
      }).filter(Boolean);
      
      console.table(publisherInfo);
      
      if (publishers.length > 10) {
        console.log(`... and ${publishers.length - 10} more publishers`);
      }
    } else {
      console.log("No publishers found in the provided data");
    }
  } catch (error) {
    console.error("Error logging publisher IDs:", error);
  }
}
