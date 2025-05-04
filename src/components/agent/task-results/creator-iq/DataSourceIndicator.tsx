
import { DataStatus } from "@/components/ui/data-status";

interface DataSourceIndicatorProps {
  endpoint: {
    data?: {
      _metadata?: {
        source?: string;
        isFresh?: boolean;
        error?: string;
        isComplete?: boolean;
      };
    };
  };
}

export const DataSourceIndicator = ({ endpoint }: DataSourceIndicatorProps) => {
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
