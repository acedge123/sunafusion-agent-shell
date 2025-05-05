
import { useState } from "react";
import { PaginationDisplay } from "./PaginationDisplay";
import { toast } from "sonner";

interface ListCollectionProps {
  endpoint: {
    data: {
      ListsCollection: any[];
      total?: number;
      page?: number | string;
      total_pages?: number | string;
      limit?: number;
    };
  };
  onPageChange?: (page: number) => void;
}

export const ListCollection = ({ endpoint, onPageChange }: ListCollectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  
  // Get the complete list collection
  const lists = endpoint.data.ListsCollection || [];
  
  // Determine if we need to show pagination controls
  const totalLists = endpoint.data.total || lists.length;
  const currentPage = parseInt(String(endpoint.data.page || 1));
  const totalPages = parseInt(String(endpoint.data.total_pages || 1));
  const hasMultiplePages = totalPages > 1;
  
  // For debugging purposes - this helps track how many items we're actually showing
  const actualItemCount = lists.length;
  // console.log(`Rendering ${actualItemCount} lists out of ${totalLists} total items`);
  
  const handlePageChange = async (page: number) => {
    if (onPageChange) {
      setIsLoading(true);
      try {
        await onPageChange(page);
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
        onPageChange(1);
        toast.success("Loading all lists");
      } catch (error) {
        toast.error("Failed to load all lists");
        console.error("Error loading all lists:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <>
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {totalLists} lists found 
          {hasMultiplePages && !showAll ? ` (page ${currentPage} of ${totalPages})` : ''}
          
          {/* Debug info */}
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
            // Make sure we're accessing the nested list data correctly
            const listData = listItem.List || {};
            
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
