
import { Search } from "lucide-react";
import { PaginationDisplay } from "./PaginationDisplay";
import { Fragment } from "react";
import { DataStatus } from "@/components/ui/data-status";

interface CampaignListProps {
  endpoint: {
    data: {
      CampaignCollection: any[];
      filtered_by?: string;
      total?: number;
      page?: number | string;
      total_pages?: number | string;
    };
  };
}

export const CampaignList = ({ endpoint }: CampaignListProps) => {
  // Function to render campaign data with fallback handling
  const renderCampaignItem = (campaignItem: any, cIdx: number) => {
    // Make sure we're accessing the nested campaign data correctly
    const campaignData = campaignItem.Campaign || {};
    const dataStatus = campaignItem._metadata?.isComplete === false ? 'partial' : 'complete';
    
    return (
      <div key={cIdx} className="border rounded p-3 bg-muted/30">
        <h5 className="font-medium flex items-center gap-2">
          {campaignData.CampaignName || "Unnamed Campaign"}
          <DataStatus 
            status={dataStatus} 
            message={dataStatus === 'partial' ? 
              `Some campaign data is incomplete: ${campaignItem._metadata?.missingFields?.join(', ')}` : 
              "Campaign data is complete"}
          />
        </h5>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
          <div>ID: <span className="text-muted-foreground">{campaignData.CampaignId || "Unknown"}</span></div>
          <div>Status: <span className="text-muted-foreground">{campaignData.CampaignStatus || "Unknown"}</span></div>
          {campaignData.StartDate && (
            <div>Start: <span className="text-muted-foreground">{campaignData.StartDate}</span></div>
          )}
          {campaignData.EndDate && (
            <div>End: <span className="text-muted-foreground">{campaignData.EndDate}</span></div>
          )}
          <div>Publishers: <span className="text-muted-foreground">
            {campaignData.PublishersCount !== undefined ? campaignData.PublishersCount : "Unknown"}
          </span></div>
        </div>
      </div>
    );
  };
  
  return (
    <Fragment>
      <div className="text-sm text-muted-foreground flex items-center">
        <Search className="h-4 w-4 mr-2" />
        {endpoint.data.filtered_by ? (
          <span>Found {endpoint.data.CampaignCollection.length} campaigns matching "{endpoint.data.filtered_by}" 
            (from {endpoint.data.total || 'unknown'} total)</span>
        ) : (
          <span>{endpoint.data.total || endpoint.data.CampaignCollection.length} campaigns found 
            (page {endpoint.data.page || 1} of {endpoint.data.total_pages || 1})</span>
        )}
      </div>
      
      {/* Add pagination for campaigns */}
      <PaginationDisplay data={endpoint.data} />
      
      <div className="space-y-2 mt-3">
        {endpoint.data.CampaignCollection.length > 0 ? (
          endpoint.data.CampaignCollection.map((campaignItem: any, cIdx: number) => 
            renderCampaignItem(campaignItem, cIdx)
          )
        ) : (
          <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded border">
            No campaigns found. Try adjusting your search terms or checking campaign naming conventions.
          </div>
        )}
      </div>
    </Fragment>
  );
};
