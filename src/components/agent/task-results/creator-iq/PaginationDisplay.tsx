
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface PaginationDisplayProps {
  data: {
    page?: string | number;
    total_pages?: string | number;
  };
  onPageChange?: (page: number) => void;
}

export const PaginationDisplay = ({ data, onPageChange }: PaginationDisplayProps) => {
  if (!data || !data.page || !data.total_pages) return null;
  
  const currentPage = parseInt(String(data.page));
  const totalPages = parseInt(String(data.total_pages));
  
  if (totalPages <= 1) return null;
  
  // Create an array of pages to display
  let pages = [];
  if (totalPages <= 5) {
    // Show all pages if 5 or fewer
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Show first, last, current and adjacent pages
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }
  
  // Handle page changes
  const handlePageClick = (page: number) => {
    if (onPageChange && page !== currentPage) {
      console.log(`Changing to page ${page}`);
      onPageChange(page);
    }
  };
  
  return (
    <Pagination className="mt-2">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handlePageClick(currentPage - 1);
              }} 
            />
          </PaginationItem>
        )}
        
        {pages.map((page, index) => (
          <PaginationItem key={index}>
            {page === '...' ? (
              <span className="px-2">...</span>
            ) : (
              <PaginationLink 
                href="#" 
                isActive={page === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof page === 'number') {
                    handlePageClick(page);
                  }
                }}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handlePageClick(currentPage + 1);
              }} 
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
