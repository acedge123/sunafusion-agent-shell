
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
    };
  };
  onPageChange?: (page: number) => void;
}

export const ListCollection = ({ endpoint, onPageChange }: ListCollectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  return (
    <>
      <div className="text-sm text-muted-foreground">
        {endpoint.data.total || endpoint.data.ListsCollection.length} lists found 
        (page {endpoint.data.page || 1} of {endpoint.data.total_pages || 1})
      </div>
      
      {/* Add pagination for lists */}
      <PaginationDisplay 
        data={endpoint.data} 
        onPageChange={handlePageChange} 
      />
      
      <div className={`space-y-2 mt-3 ${isLoading ? 'opacity-60' : ''}`}>
        {endpoint.data.ListsCollection.length > 0 ? (
          endpoint.data.ListsCollection.map((listItem: any, lIdx: number) => {
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
