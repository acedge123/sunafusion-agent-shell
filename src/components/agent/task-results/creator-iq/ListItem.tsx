
import React from 'react';

// Define the interface for list data structure
interface ListData {
  Name?: string;
  Id?: string | number;
  Description?: string;
  Publishers?: Array<any>;
}

interface ListItemProps {
  listData: ListData;
  index: number;
}

export const ListItem = ({ listData, index }: ListItemProps) => {
  return (
    <div key={index} className="border rounded p-3 bg-muted/30">
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
};
