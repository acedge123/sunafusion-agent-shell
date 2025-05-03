
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wrench, Database, Search, FileText } from "lucide-react";
import { Fragment } from "react";

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
            <TabsTrigger value="creator_iq_data">
              <Database className="h-4 w-4 mr-1" />
              Creator IQ Data
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
              <h3 className="text-lg font-medium">Creator IQ Data</h3>
              {creatorIQData.results.map((endpoint, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-2">
                  <h4 className="font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    {endpoint.name || endpoint.endpoint}
                  </h4>
                  
                  {endpoint.data && endpoint.data.CampaignCollection && (
                    <Fragment>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Search className="h-4 w-4 mr-2" />
                        {endpoint.data.filtered_by ? (
                          <span>Found {endpoint.data.CampaignCollection.length} campaigns matching "{endpoint.data.filtered_by}" 
                            (from {endpoint.data.total} total)</span>
                        ) : (
                          <span>{endpoint.data.total} campaigns found (page {endpoint.data.page} of {endpoint.data.total_pages || 1})</span>
                        )}
                      </div>
                      <div className="space-y-2 mt-3">
                        {endpoint.data.CampaignCollection.map((campaignItem: any, cIdx: number) => (
                          <div key={cIdx} className="border rounded p-3 bg-muted/30">
                            <h5 className="font-medium">
                              {campaignItem.Campaign?.CampaignName || "Unnamed Campaign"}
                            </h5>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                              <div>ID: <span className="text-muted-foreground">{campaignItem.Campaign?.CampaignId}</span></div>
                              <div>Status: <span className="text-muted-foreground">{campaignItem.Campaign?.CampaignStatus || "Unknown"}</span></div>
                              {campaignItem.Campaign?.StartDate && (
                                <div>Start: <span className="text-muted-foreground">{campaignItem.Campaign.StartDate}</span></div>
                              )}
                              {campaignItem.Campaign?.EndDate && (
                                <div>End: <span className="text-muted-foreground">{campaignItem.Campaign.EndDate}</span></div>
                              )}
                              {campaignItem.Campaign?.PublishersCount !== undefined && (
                                <div>Publishers: <span className="text-muted-foreground">{campaignItem.Campaign.PublishersCount}</span></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Fragment>
                  )}
                  
                  {endpoint.data && endpoint.data.ListsCollection && (
                    <Fragment>
                      <div className="text-sm text-muted-foreground">
                        {endpoint.data.total} lists found (page {endpoint.data.page} of {endpoint.data.total_pages || 1})
                      </div>
                      <div className="space-y-2 mt-3">
                        {endpoint.data.ListsCollection.map((listItem: any, lIdx: number) => (
                          <div key={lIdx} className="border rounded p-3 bg-muted/30">
                            <h5 className="font-medium">
                              {listItem.List?.Name || "Unnamed List"}
                            </h5>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                              <div>ID: <span className="text-muted-foreground">{listItem.List?.Id}</span></div>
                              {listItem.List?.Description && (
                                <div className="col-span-2">Description: <span className="text-muted-foreground">{listItem.List.Description}</span></div>
                              )}
                              {listItem.List?.Publishers && (
                                <div className="col-span-2">Publishers: <span className="text-muted-foreground">{listItem.List.Publishers.length}</span></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Fragment>
                  )}
                  
                  {endpoint.data && endpoint.data.PublisherCollection && (
                    <Fragment>
                      <div className="text-sm text-muted-foreground">
                        {endpoint.data.total} publishers found (page {endpoint.data.page} of {endpoint.data.total_pages || 1})
                      </div>
                      <div className="space-y-2 mt-3">
                        {endpoint.data.PublisherCollection.map((publisherItem: any, pIdx: number) => (
                          <div key={pIdx} className="border rounded p-3 bg-muted/30">
                            <h5 className="font-medium">
                              {publisherItem.Publisher?.PublisherName || "Unnamed Publisher"}
                            </h5>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                              <div>ID: <span className="text-muted-foreground">{publisherItem.Publisher?.Id}</span></div>
                              {publisherItem.Publisher?.Status && (
                                <div>Status: <span className="text-muted-foreground">{publisherItem.Publisher.Status}</span></div>
                              )}
                              {publisherItem.Publisher?.TotalSubscribers && (
                                <div>Subscribers: <span className="text-muted-foreground">{publisherItem.Publisher.TotalSubscribers}</span></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Fragment>
                  )}
                  
                  {/* Display raw data if none of the known collections are found */}
                  {!endpoint.data?.CampaignCollection && 
                   !endpoint.data?.ListsCollection && 
                   !endpoint.data?.PublisherCollection && (
                    <pre className="overflow-auto text-xs p-3 bg-muted/30 rounded-md max-h-96">
                      {JSON.stringify(endpoint.data, null, 2)}
                    </pre>
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
