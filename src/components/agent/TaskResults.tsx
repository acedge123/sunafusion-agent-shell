import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wrench, Database, Search, FileText, AlertTriangle } from "lucide-react";
import { Fragment } from "react";
import { DataStatus, getDataStatus } from "@/components/ui/data-status";

interface TaskResult {
  answer: string;
  reasoning?: string;
  steps_taken?: Array<{
    step: number;
    action: string;
    result: string;
  }>;
  tools_used?: string[];
  sources?: Array<{
    source: string;
    results: any[];
    error?: string;
  }>;
}

interface TaskResultsProps {
  result: TaskResult;
}

export const TaskResults = ({ result }: TaskResultsProps) => {
  // Check if we have Creator IQ data in the sources
  const creatorIQData = result.sources?.find(source => source.source === "creator_iq");
  
  // Determine if there are any errors in Creator IQ data
  const hasCreatorIQErrors = creatorIQData?.error || 
    creatorIQData?.results?.some(result => result.error);
  
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
  
  // Function to render data source indicator
  const renderDataSourceIndicator = (endpoint: any) => {
    if (!endpoint.data || !endpoint.data._metadata) return null;
    
    const metadata = endpoint.data._metadata;
    let status: 'complete' | 'partial' | 'error' | 'cached' | 'loading' = 'complete';
    let message = "Data is current and complete";
    
    if (metadata.source === 'local' || metadata.source === 'fallback') {
      status = 'cached';
      message = `Using ${metadata.isFresh ? 'recent' : 'older'} cached data`;
    } else if (metadata.error) {
      status = 'error';
      message = metadata.error;
    } else if (!metadata.isComplete) {
      status = 'partial';
      message = "Some data fields may be missing or using default values";
    }
    
    return (
      <div className="flex items-center mt-1 mb-3">
        <DataStatus status={status} message={message} showText />
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      {result.tools_used && result.tools_used.length > 0 && (
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            {result.tools_used.map(tool => (
              <Badge key={tool} variant="secondary" className="text-xs">
                {tool}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <Tabs defaultValue="answer">
        <TabsList className="mb-2">
          <TabsTrigger value="answer">Answer</TabsTrigger>
          {result.reasoning && <TabsTrigger value="reasoning">Thinking Process</TabsTrigger>}
          {result.steps_taken && result.steps_taken.length > 0 && (
            <TabsTrigger value="steps">Steps Taken</TabsTrigger>
          )}
          {creatorIQData && creatorIQData.results && creatorIQData.results.length > 0 && (
            <TabsTrigger value="creator_iq_data" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              Creator IQ Data
              {hasCreatorIQErrors && (
                <AlertTriangle className="h-3 w-3 text-amber-500 ml-1" />
              )}
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="answer" className="mt-0">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {result.answer.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </TabsContent>
        
        {result.reasoning && (
          <TabsContent value="reasoning" className="mt-0">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {result.reasoning.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </TabsContent>
        )}
        
        {result.steps_taken && result.steps_taken.length > 0 && (
          <TabsContent value="steps" className="mt-0">
            <div className="space-y-4">
              {result.steps_taken.map((step, index) => (
                <div key={index} className="rounded-md border p-4">
                  <h4 className="font-medium">
                    Step {step.step}: {step.action}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.result}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        )}
        
        {creatorIQData && creatorIQData.results && creatorIQData.results.length > 0 && (
          <TabsContent value="creator_iq_data" className="mt-0">
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
                  {renderDataSourceIndicator(endpoint)}
                  
                  {endpoint.data && endpoint.data.CampaignCollection && (
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
                      <div className="space-y-2 mt-3">
                        {endpoint.data.CampaignCollection.length > 0 ? (
                          endpoint.data.CampaignCollection.map((campaignItem: any, cIdx: number) => 
                            renderCampaignItem(campaignItem, cIdx)
                          )
                        ) : (
                          <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded border">
                            No campaigns found
                          </div>
                        )}
                      </div>
                    </Fragment>
                  )}
                  
                  {endpoint.data && endpoint.data.ListsCollection && (
                    <Fragment>
                      <div className="text-sm text-muted-foreground">
                        {endpoint.data.total || endpoint.data.ListsCollection.length} lists found 
                        (page {endpoint.data.page || 1} of {endpoint.data.total_pages || 1})
                      </div>
                      <div className="space-y-2 mt-3">
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
                            No lists found
                          </div>
                        )}
                      </div>
                    </Fragment>
                  )}
                  
                  {endpoint.data && endpoint.data.PublisherCollection && (
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
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
