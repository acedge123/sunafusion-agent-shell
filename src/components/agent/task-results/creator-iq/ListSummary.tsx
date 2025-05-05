
import React from 'react';

interface ListSummaryProps {
  totalLists: number;
  actualItemCount: number;
  isLoading: boolean;
}

export const ListSummary = ({ totalLists, actualItemCount, isLoading }: ListSummaryProps) => {
  return (
    <div className="text-sm text-muted-foreground">
      {totalLists} lists found 
      
      {/* Display item count information if needed */}
      {actualItemCount !== totalLists && !isLoading && (
        <span className="ml-2 text-xs text-blue-500">
          (showing {actualItemCount} items)
        </span>
      )}
    </div>
  );
};
