
import { useState, useEffect } from "react";
import { PaginationDisplay } from "./PaginationDisplay";
import { toast } from "sonner";

// Define the interface for list data structure
interface ListData {
  Name?: string;
  Id?: string | number;
  Description?: string;
  Publishers?: Array<any>;
}

interface ListCollectionProps {
  endpoint: {
    data: {
      ListsCollection: any[];
      total?: number;
      page?: number | string;
      total_pages?: number | string;
      limit?: number;
      _all_pages_fetched?: boolean;
    };
  };
  onPageChange?: (page: number, limit?: number, fetchAll?: boolean) => void;
}

export const ListCollection = ({ endpoint, onPageChange }: ListCollectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAll, setShowAll] = useState(true); // Default to showing all lists
  
  // Get the complete list collection
  const lists = endpoint.data.ListsCollection || [];
  
  // Determine if we need to show pagination controls
  const totalLists = endpoint.data.total || lists.length;
  const currentPage = parseInt(String(endpoint.data.page || 1));
  const totalPages = parseInt(String(endpoint.data.total_pages || 1));
  const hasMultiplePages = totalPages > 1;
  const allPagesFetched = endpoint.data._all_pages_fetched === true;
  
  // For debugging purposes - this helps track how many items we're actually showing
  const actualItemCount = lists.length;
  console.log(`Rendering ${actualItemCount} lists out of ${totalLists} total items`);
  console.log(`Page metadata: page ${currentPage} of ${totalPages} with limit ${endpoint.data.limit || 'unknown'}`);
  console.log(`All pages fetched: ${allPagesFetched ? 'Yes' : 'No'}`);
  
  // Check for specific list names in the data for debugging
  useEffect(() => {
    if (lists && lists.length > 0) {
      const listNames = lists.map(listItem => {
        // Handle nested List structures
        if (listItem.List && listItem.List.List) {
          return listItem.List.List.Name;
        } else if (listItem.List) {
          return listItem.List.Name;
        }
        return null;
      }).filter(Boolean);
      
      console.log(`List names sample in component (${listNames.length}):`, listNames.slice(0, 10));
      
      // Check for TestList specifically
      const testListEntries = listNames.filter(name => 
        name && typeof name === 'string' && name.toLowerCase().includes('test')
      );
      
      if (testListEntries.length > 0) {
        console.log(`Found Test-related list entries:`, testListEntries);
      } else {
        console.log('No Test-related lists found in current data');
      }
    }
  }, [lists]);
  
  const handlePageChange = async (page: number) => {
    if (onPageChange) {
      setIsLoading(true);
      try {
        // When changing pages, we want to get all items for that page
        // but with a reasonable limit
        await onPageChange(page, 100, true);
        toast.success(`Loaded page ${page}`);
      } catch (error) {
        toast.error(`Failed to load page ${page}`);
        console.error("Error changing page:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleShowAllToggle = () => {
    setShowAll(prev => !prev);
    if (!showAll && onPageChange) {
      // Load all possible data when toggling "show all"
      setIsLoading(true);
      try {
        // Request a very large limit to ensure all data is fetched
        onPageChange(1, 2000, true);
        toast.success("Loading all lists");
      } catch (error) {
        toast.error("Failed to load all lists");
        console.error("Error loading all lists:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Effect to check if we need to load all lists when first mounted
  useEffect(() => {
    // If the data shows we have multiple pages but are only showing a subset of data
    // and all pages weren't fetched yet
    if (hasMultiplePages && actualItemCount < totalLists && !allPagesFetched && onPageChange) {
      console.log("Lists data is incomplete, attempting to load all lists...");
      setIsLoading(true);
      onPageChange(1, 2000, true)
        .finally(() => setIsLoading(false));
    }
  }, [hasMultiplePages, actualItemCount, totalLists, allPagesFetched, onPageChange]);
  
  return (
    <>
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {totalLists} lists found 
          {hasMultiplePages && !showAll ? ` (page ${currentPage} of ${totalPages})` : ''}
          
          {/* Display item count information if needed */}
          {actualItemCount !== totalLists && (
            <span className="ml-2 text-xs text-blue-500">
              (showing {actualItemCount} items)
            </span>
          )}
        </div>
        
        {hasMultiplePages && (
          <button 
            onClick={handleShowAllToggle}
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            {showAll ? "Show paged view" : "Show all lists"}
          </button>
        )}
      </div>
      
      {/* Show pagination only if we have multiple pages and not in "show all" mode */}
      {hasMultiplePages && !showAll && (
        <PaginationDisplay 
          data={endpoint.data} 
          onPageChange={handlePageChange}
        />
      )}
      
      <div className={`space-y-2 mt-3 ${isLoading ? 'opacity-60' : ''}`}>
        {lists.length > 0 ? (
          lists.map((listItem: any, lIdx: number) => {
            // Handle nested list data correctly
            let listData: ListData = {};
            
            // First try with List.List pattern
            if (listItem.List && listItem.List.List) {
              listData = listItem.List.List;
            } 
            // Then try just List
            else if (listItem.List) {
              listData = listItem.List;
            } 
            // Fallback to the item itself
            else {
              listData = listItem;
            }
            
            return (
              <div key={lIdx} className="border rounded p-3 bg-muted/30">
                <h5 className="font-medium">
                  {listData.Name || "Unnamed List"}
                </h5>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                  <div>ID: <span className="text-muted-foreground">{listData.Id || "Unknown"}</span></div>
                  {listData.Description && (
                    <div className="col-span-2">Description: <span className="text-muted-foreground">{listData.Description}</span></div>
                  )}
                  <div className="col-span-2">Publishers: <span className="text-muted-foreground">
                    {listData.Publishers?.length !== undefined ? listData.Publishers.length : "Unknown"}
                  </span></div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded border">
            {isLoading ? "Loading..." : "No lists found"}
          </div>
        )}
      </div>
    </>
  );
};
