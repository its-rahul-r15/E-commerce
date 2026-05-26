import React from 'react';

const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    hasNextPage, 
    hasPrevPage, 
    totalItems = null,
    itemsPerPage = null
}) => {
    if (totalPages <= 1) return null;

    // Helper to calculate page ranges to show
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, currentPage + 2);
            
            if (currentPage <= 3) {
                end = 5;
            } else if (currentPage >= totalPages - 2) {
                start = totalPages - 4;
            }
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }
        return pages;
    };

    // Calculate showing range text
    const showingText = () => {
        if (totalItems === null || itemsPerPage === null) return null;
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(currentPage * itemsPerPage, totalItems);
        return `Showing ${start}-${end} of ${totalItems.toLocaleString()} items`;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-[var(--gold)]/10 text-black text-xs font-semibold">
            {/* Showing items count */}
            <div className="text-gray-400 font-bold uppercase tracking-wider">
                {showingText() || `Page ${currentPage} of ${totalPages}`}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-1.5">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!hasPrevPage}
                    className={`p-2 border transition-all ${
                        hasPrevPage
                            ? 'border-[var(--gold)]/20 hover:bg-[var(--mehron)] hover:text-white hover:border-[var(--gold)] text-[var(--mehron)]'
                            : 'border-gray-200 text-gray-300 cursor-not-allowed'
                    }`}
                    title="Previous Page"
                >
                    <svg className="w-3.5 h-3.5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Page Number Buttons */}
                {getPageNumbers().map(num => (
                    <button
                        key={num}
                        onClick={() => onPageChange(num)}
                        className={`w-8 h-8 font-serif font-bold transition-all border ${
                            currentPage === num
                                ? 'bg-[var(--gold)] text-[var(--mehron)] border-[var(--gold)] shadow-md'
                                : 'border-[var(--gold)]/10 text-[var(--mehron)] hover:bg-[var(--gold-pale)] hover:border-[var(--gold)]/35'
                        }`}
                    >
                        {num}
                    </button>
                ))}

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    className={`p-2 border transition-all ${
                        hasNextPage
                            ? 'border-[var(--gold)]/20 hover:bg-[var(--mehron)] hover:text-white hover:border-[var(--gold)] text-[var(--mehron)]'
                            : 'border-gray-200 text-gray-300 cursor-not-allowed'
                    }`}
                    title="Next Page"
                >
                    <svg className="w-3.5 h-3.5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Pagination;
