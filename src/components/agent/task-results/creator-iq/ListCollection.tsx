
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ListItem } from "./ListItem";
import { ListSummary } from "./ListSummary";
import { EmptyListState } from "./EmptyListState";
import { extractListData } from "./listUtils";

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
  onPageChange?: (page?: number, limit?: number, fetchAll?: boolean) => Promise<any> | void;
}

export const ListCollection = ({ endpoint, onPageChange }: ListCollectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the complete list collection
  const lists = endpoint.data.ListsCollection || [];
  
  // Information about total data
  const totalLists = endpoint.data.total || lists.length;
  const allPagesFetched = endpoint.data._all_pages_fetched === true;
  
  // For debugging purposes - this helps track how many items we're actually showing
  const actualItemCount = lists.length;
  console.log(`Rendering ${actualItemCount} lists out of ${totalLists} total items`);
  console.log(`All pages fetched: ${allPagesFetched ? 'Yes' : 'No'}`);
  
  // Effect to check if we need to load all lists when first mounted
  useEffect(() => {
    // If all pages weren't fetched yet and we have an onPageChange function and there's a discrepancy
    if (!allPagesFetched && actualItemCount < totalLists && onPageChange && actualItemCount > 0) {
      console.log("Lists data is incomplete, attempting to load all lists...");
      setIsLoading(true);
      
      // Handle the Promise properly
      const loadData = async () => {
        try {
          const result = onPageChange(1, 5000, true);
          // Check if result is a Promise before awaiting
          if (result instanceof Promise) {
            await result;
            toast.success(`All ${totalLists} lists loaded successfully`);
          }
        } catch (error) {
          console.error("Error loading all lists:", error);
          toast.error("Error loading all lists");
        } finally {
          setIsLoading(false);
        }
      };
      
      loadData();
    }
  }, [allPagesFetched, actualItemCount, totalLists, onPageChange]);
  
  return (
    <>
      <ListSummary 
        totalLists={totalLists} 
        actualItemCount={actualItemCount} 
        isLoading={isLoading} 
      />
      
      <div className={`space-y-2 mt-3 ${isLoading ? 'opacity-60' : ''}`}>
        {lists.length > 0 ? (
          lists.map((listItem: any, lIdx: number) => {
            const listData = extractListData(listItem);
            return <ListItem key={lIdx} listData={listData} index={lIdx} />;
          })
        ) : (
          <EmptyListState isLoading={isLoading} />
        )}
      </div>
      
      {/* Show pagination status */}
      {lists.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground text-center">
          {allPagesFetched ? (
            <span className="text-green-600">✓ All {totalLists} lists loaded</span>
          ) : (
            <span className="text-orange-600">
              Showing {actualItemCount} of {totalLists} lists
              {isLoading && " - Loading more..."}
            </span>
          )}
        </div>
      )}
    </>
  );
};
