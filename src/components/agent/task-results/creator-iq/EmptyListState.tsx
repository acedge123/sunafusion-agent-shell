
import React from 'react';

interface EmptyListStateProps {
  isLoading: boolean;
}

export const EmptyListState = ({ isLoading }: EmptyListStateProps) => {
  return (
    <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded border">
      {isLoading ? "Loading..." : "No lists found"}
    </div>
  );
};
