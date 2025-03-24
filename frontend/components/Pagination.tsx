import React from 'react';

interface PaginationProps {
  totalPages: number;
  page: number;
  onPageChange?: (page: number) => void; // Optional function to handle page changes
}

const Pagination: React.FC<PaginationProps> = ({ totalPages, page, onPageChange }) => {
  const handlePrev = () => {
    if (page > 1 && onPageChange) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages && onPageChange) onPageChange(page + 1);
  };

  return (
    <div className="pagination flex justify-center items-center space-x-4">
      <button
        onClick={handlePrev}
        disabled={page === 1}
        className="pagination-btn"
      >
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={page === totalPages}
        className="pagination-btn"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
