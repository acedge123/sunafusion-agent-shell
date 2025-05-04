
import { PaginationDisplay } from "./PaginationDisplay";
import { Fragment } from "react";
import { DataStatus } from "@/components/ui/data-status";

interface PublisherListProps {
  endpoint: {
    data: {
      PublisherCollection: any[];
      campaignName?: string;
      total?: number;
      page?: number | string;
      total_pages?: number | string;
    };
  };
}

export const PublisherList = ({ endpoint }: PublisherListProps) => {
  // Function to render publisher data with fallback handling
  const renderPublisherItem = (publisherItem: any, pIdx: number) => {
    // Make sure we're accessing the nested publisher data correctly
    const publisherData = publisherItem.Publisher || {};
    const dataStatus = publisherItem._metadata?.isComplete === false ? 'partial' : 'complete';
    
    return (
      <div key={pIdx} className="border rounded p-3 bg-muted/30">
        <h5 className="font-medium flex items-center gap-2">
          {publisherData.PublisherName || "Unnamed Publisher"}
          <DataStatus status={dataStatus} />
        </h5>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
          <div>ID: <span className="text-muted-foreground">{publisherData.Id || "Unknown"}</span></div>
          {publisherData.Status && (
            <div>Status: <span className="text-muted-foreground">{publisherData.Status}</span></div>
          )}
          {publisherData.TotalSubscribers && (
            <div>Subscribers: <span className="text-muted-foreground">{publisherData.TotalSubscribers}</span></div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <Fragment>
      <div className="text-sm text-muted-foreground">
        {endpoint.data.campaignName && (
          <div className="mb-2">
            <span className="font-medium">Campaign:</span> {endpoint.data.campaignName}
          </div>
        )}
        {endpoint.data.total || endpoint.data.PublisherCollection.length} publishers found
        (page {endpoint.data.page || 1} of {endpoint.data.total_pages || 1})
      </div>
      
      {/* Add pagination for publishers */}
      <PaginationDisplay data={endpoint.data} />
      
      <div className="space-y-2 mt-3">
        {endpoint.data.PublisherCollection.length > 0 ? (
          endpoint.data.PublisherCollection.map((publisherItem: any, pIdx: number) => 
            renderPublisherItem(publisherItem, pIdx)
          )
        ) : (
          <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded border">
            No publishers found
          </div>
        )}
      </div>
    </Fragment>
  );
};
