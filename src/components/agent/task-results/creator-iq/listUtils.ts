
// Define the interface for list data structure
export interface ListData {
  Name?: string;
  Id?: string | number;
  Description?: string;
  Publishers?: Array<any>;
}

// Helper function to extract list data from nested structures
export const extractListData = (listItem: any): ListData => {
  let listData: ListData = {};
  
  // First try with List.List pattern
  if (listItem.List && listItem.List.List) {
    listData = listItem.List.List;
  } 
  // Then try just List
  else if (listItem.List) {
    listData = listItem.List;
  } 
  // Fallback to the item itself
  else {
    listData = listItem;
  }
  
  return listData;
};
