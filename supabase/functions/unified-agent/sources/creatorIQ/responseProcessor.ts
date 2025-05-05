
// Processes API responses from Creator IQ

/**
 * Process metadata in API responses
 */
export function processResponseMetadata(data: any, endpoint: any) {
  // If this is a successful list creation, add metadata
  if (endpoint.method === "POST" && endpoint.route === "/lists" && data.List && data.List.Id) {
    console.log(`Successfully created list: ${data.List.Name} (ID: ${data.List.Id})`);
    
    // Add operation metadata
    data.operation = {
      type: "Create List",
      successful: true,
      details: `Created list: ${data.List.Name} (ID: ${data.List.Id})`,
      timestamp: new Date().toISOString()
    };
  }
  
  // If this is a successful publisher addition to list, add metadata
  if (endpoint.method === "POST" && endpoint.route.includes("/lists/") && endpoint.route.includes("/publishers")) {
    // Extract list ID from the URL
    const listId = endpoint.route.match(/\/lists\/(\d+)\/publishers/)?.[1];
    const publisherIds = endpoint?.payload?.PublisherIds || [];
    
    console.log(`Added publishers to list ${listId}`);
    
    // Add operation metadata
    data.operation = {
      type: "Add Publishers To List",
      successful: true,
      details: `Added publishers to list ${listId}`,
      timestamp: new Date().toISOString(),
      listId: listId,
      publisherIds: publisherIds
    };
    
    // Add additional metadata for state tracking
    data.listId = listId;
    data.success = true;
    data.message = `Publishers added to list ${listId}`;
    data.publisherIds = publisherIds;
  }
  
  // If this is a successful publisher addition to campaign, add metadata
  if (endpoint.method === "POST" && endpoint.route.includes("/campaigns/") && endpoint.route.includes("/publishers")) {
    // Extract campaign ID from the URL
    const campaignId = endpoint.route.match(/\/campaigns\/(\d+)\/publishers/)?.[1];
    const publisherIds = endpoint?.payload?.PublisherIds || [];
    
    console.log(`Added publishers to campaign ${campaignId}`);
    
    // Add operation metadata
    data.operation = {
      type: "Add Publishers To Campaign",
      successful: true,
      details: `Added publishers to campaign ${campaignId}`,
      timestamp: new Date().toISOString(),
      campaignId: campaignId,
      publisherIds: publisherIds
    };
    
    // Add additional metadata for state tracking
    data.campaignId = campaignId;
    data.success = true;
    data.message = `Publishers added to campaign ${campaignId}`;
    data.publisherIds = publisherIds;
  }
  
  // Enhanced handling for message operations
  if (endpoint.route.includes("/messages") && endpoint.method === "POST") {
    // Extract publisher ID from the URL
    const publisherId = endpoint.route.match(/\/publishers\/(\d+)\/messages/)?.[1];
    
    console.log(`Successfully sent message to publisher ${publisherId}`);
    
    // Add more detailed operation metadata
    data.operation = {
      type: "Send Message",
      successful: true,
      details: `Message sent successfully to publisher ${publisherId}`,
      timestamp: new Date().toISOString(),
      publisherId: publisherId
    };
    
    // Add additional metadata for state tracking
    data.publisherId = publisherId;
    data.success = true;
    data.messageId = data.MessageId || data.Id || new Date().getTime().toString(); // Use API-provided ID or generate one
    data.message = `Message sent successfully to publisher ${publisherId}`;
    
    // Store the publisher ID and message content for future reference
    data.sentMessage = {
      publisherId: publisherId,
      content: endpoint?.payload?.Content,
      subject: endpoint?.payload?.Subject,
      sentAt: new Date().toISOString()
    };
  }
}
