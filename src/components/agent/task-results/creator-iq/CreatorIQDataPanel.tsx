
import { AlertTriangle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Fragment } from "react";
import { DataSourceIndicator } from "./DataSourceIndicator";
import { CampaignList } from "./CampaignList";
import { PublisherList } from "./PublisherList";
import { ListCollection } from "./ListCollection";
import { PaginationDisplay } from "./PaginationDisplay";

interface CreatorIQDataPanelProps {
  creatorIQData: {
    source: string;
    results: any[];
    error?: string;
  };
}

export const CreatorIQDataPanel = ({ creatorIQData }: CreatorIQDataPanelProps) => {
  // Determine if there are any errors in Creator IQ data
  const hasCreatorIQErrors = creatorIQData?.error || 
    creatorIQData?.results?.some(result => result.error);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        Creator IQ Data
        {hasCreatorIQErrors && (
          <span className="text-sm font-normal text-amber-500 flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Some data may be incomplete
          </span>
        )}
      </h3>
      
      {creatorIQData.results.map((endpoint, idx) => (
        <div key={idx} className="border rounded-lg p-4 space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 mr-2" />
            {endpoint.name || endpoint.endpoint}
            {endpoint.error && (
              <Badge variant="destructive" className="text-xs">Error</Badge>
            )}
          </h4>
          
          {/* Render data source indicator */}
          <DataSourceIndicator endpoint={endpoint} />
          
          {/* Campaign Collection */}
          {endpoint.data && endpoint.data.CampaignCollection && (
            <CampaignList endpoint={endpoint} />
          )}
          
          {/* Lists Collection */}
          {endpoint.data && endpoint.data.ListsCollection && (
            <ListCollection endpoint={endpoint} />
          )}
          
          {/* Publisher Collection */}
          {endpoint.data && endpoint.data.PublisherCollection && (
            <PublisherList endpoint={endpoint} />
          )}
          
          {/* Display raw data if none of the known collections are found */}
          {!endpoint.data?.CampaignCollection && 
           !endpoint.data?.ListsCollection && 
           !endpoint.data?.PublisherCollection && endpoint.data && (
            <pre className="overflow-auto text-xs p-3 bg-muted/30 rounded-md max-h-96">
              {JSON.stringify(endpoint.data, null, 2)}
            </pre>
          )}
          
          {/* Display error if there was an issue with this endpoint */}
          {endpoint.error && (
            <div className="text-sm text-red-500 border border-red-200 rounded p-3 mt-2 bg-red-50 dark:bg-red-950/20">
              <div className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Error
              </div>
              <p className="mt-1">{endpoint.error}</p>
              {endpoint.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs">Technical Details</summary>
                  <pre className="text-xs mt-1 p-2 bg-red-100/50 dark:bg-red-900/20 rounded overflow-auto">
                    {endpoint.details}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
