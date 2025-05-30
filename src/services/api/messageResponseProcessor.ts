
import { Message } from "@/components/chat/ChatContainer";
import { v4 as uuidv4 } from "uuid";
import { storeProviderToken } from "./tokenService";
import { processCreatorIQResponse } from "./creatorIQ";
import { normalizeNestedData, extractPublisherIds } from "../../utils/creatorIQ/dataExtraction";

/**
 * Process the agent response data and create a response message
 */
export async function processAgentResponse(
  responseData: any,
  stateKey: string | null = null,
  userId: string | undefined = undefined,
  providerToken: string | null | undefined = null,
  sessionData: any = null
): Promise<Message> {
  try {
    // Log the response structure to help with debugging
    console.log("AI response structure:", Object.keys(responseData));
    console.log("Sources available:", responseData.sources?.map((s: any) => s.source));
    
    // Check for Creator IQ errors in the response
    const creatorIQSource = responseData.sources?.find((s: any) => s.source === "creator_iq");
    if (creatorIQSource && creatorIQSource.error) {
      console.error("Creator IQ error in response:", creatorIQSource.error);
    }
    
    // Also check for operation-specific errors
    if (creatorIQSource && creatorIQSource.results) {
      const operationErrors = creatorIQSource.results
        .filter((result: any) => result.error || (result.data && result.data.operation && result.data.operation.successful === false))
        .map((result: any) => ({
          endpoint: result.endpoint,
          error: result.error || (result.data?.operation?.details || "Unknown error"),
          name: result.name
        }));
      
      if (operationErrors.length > 0) {
        console.warn("Creator IQ operation errors:", operationErrors);
      }
      
      // Extract successful operations and log them
      const successfulOperations = creatorIQSource.results
        .filter((result: any) => !result.error && result.data && result.data.operation && result.data.operation.successful === true)
        .map((result: any) => ({
          endpoint: result.endpoint,
          operation: result.data.operation,
          name: result.name
        }));
      
      if (successfulOperations.length > 0) {
        console.info("Creator IQ successful operations:", successfulOperations);
      }
      
      // Extract and log message sending results specifically
      const messageResults = creatorIQSource.results
        .filter((result: any) => result.name && result.name.includes("Send Message"));
      
      if (messageResults.length > 0) {
        console.info("Message sending results:", messageResults);
        
        // Check for publisher IDs to store in previous state
        messageResults.forEach((result: any) => {
          if (result.data && result.data.publisherId) {
            console.log(`Message sent to publisher ID: ${result.data.publisherId}`);
          }
        });
      }
      
      // Log information about paginated results
      const listResults = creatorIQSource.results
        .filter((result: any) => result.name && result.name.includes("Get Lists"));
        
      if (listResults.length > 0) {
        listResults.forEach((result: any) => {
          if (result.data && result.data.ListsCollection) {
            console.log(`Lists result contains ${result.data.ListsCollection.length} items out of ${result.data.total || 'unknown'} total`);
            
            if (result.data.total_pages && result.data.total_pages > 1) {
              console.log(`Multiple pages detected: ${result.data.page || 1} of ${result.data.total_pages}`);
            }
            
            // Add detailed debug info
            console.log('Complete lists metadata:', {
              totalItems: result.data.total,
              itemsReturned: result.data.ListsCollection.length,
              currentPage: result.data.page,
              totalPages: result.data.total_pages,
              limit: result.data.limit,
              isPaginated: result.data.is_paginated
            });
            
            // Check for TestList specifically, handle nested data
            const listNames = result.data.ListsCollection
              .map((item: any) => {
                // Handle nested List structures
                if (item.List && item.List.List) {
                  return item.List.List.Name;
                } else if (item.List) {
                  return item.List.Name;
                }
                return null;
              })
              .filter(Boolean);
            
            console.log(`List names found:`, listNames.slice(0, 10));
            
            const testLists = listNames.filter(
              (name: string) => name && typeof name === 'string' && name.toLowerCase().includes('test')
            );
            
            if (testLists.length > 0) {
              console.log(`Test-related lists found:`, testLists);
            }
          }
        });
      }
      
      // Log information about publishers paginated results
      const publisherResults = creatorIQSource.results
        .filter((result: any) => result.name && 
               (result.name.includes("List Publishers") || 
                result.name.includes("Get Publishers")));
        
      if (publisherResults.length > 0) {
        publisherResults.forEach((result: any) => {
          // Check for nested structures in publishers
          if (result.data) {
            // Handle both PublisherCollection and PublishersCollection
            const collection = result.data.PublisherCollection || result.data.PublishersCollection;
            
            if (collection && Array.isArray(collection)) {
              const publisherCount = collection.length;
              console.log(`Publishers result contains ${publisherCount} items`);
              
              // Extract and log publisher IDs from potentially nested structures
              const publisherIds = collection.map((item: any) => {
                if (item.Publisher && item.Publisher.Publisher) {
                  return item.Publisher.Publisher.Id;
                } else if (item.Publisher) {
                  return item.Publisher.Id;
                }
                return null;
              }).filter(Boolean);
              
              if (publisherIds.length > 0) {
                console.log(`First 5 publisher IDs:`, publisherIds.slice(0, 5));
              }
            }
            
            if (result.data.total_pages && result.data.total_pages > 1) {
              console.log(`Multiple pages detected: ${result.data.page || 1} of ${result.data.total_pages}`);
            }
          }
        });
      }
      
      // Look for nested data in all results
      creatorIQSource.results.forEach((result: any) => {
        if (result.data) {
          // Check for double-nested list structures
          if (result.data.List && result.data.List.List) {
            console.log(`Found double-nested list structure in ${result.name}. Normalizing...`);
            // Extract the nested data for processing
            const normalizedData = normalizeNestedData(result.data);
            
            // If there are publisher IDs in the list, extract them
            if (normalizedData && Array.isArray(normalizedData.Publishers)) {
              const publisherIds = extractPublisherIds(normalizedData);
              console.log(`Extracted ${publisherIds.length} publisher IDs from nested list data`);
            }
          }
        }
      });
    }
    
    // Store provider token if available
    if (providerToken && userId && sessionData) {
      await storeProviderToken(sessionData, providerToken);
    }
    
    // Process and store any Creator IQ data for future reference
    if (stateKey && userId && responseData.sources) {
      await processCreatorIQResponse(responseData.sources);
    }

    return {
      id: uuidv4(),
      content: responseData.answer,
      role: "assistant",
      timestamp: new Date()
    };
  } catch (error) {
    console.error("Error processing agent response:", error);
    throw error;
  }
}
