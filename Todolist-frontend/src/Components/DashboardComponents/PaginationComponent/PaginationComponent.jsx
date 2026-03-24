import React from 'react';
import './PaginationComponent.css';

const PaginationComponent = ({ currentPage, totalPages, setPage }) => {
    if (!totalPages || totalPages <= 1) return null;

    const handlePrev = () => {
        setPage((p) => Math.max(1, p - 1));
    };

    const handleNext = () => {
        setPage((p) => Math.min(totalPages, p + 1));
    };

    return (
        <div className="dash-pagination">
            <button
                type="button"
                className="dash-pagination-btn"
                onClick={handlePrev}
                disabled={currentPage === 1}
            >Prev</button>
            <div className="dash-pageInfo">
                Page {currentPage} of {totalPages}
            </div>
            <button
                type="button"
                className="dash-pagination-btn"
                onClick={handleNext}
                disabled={currentPage === totalPages}
            >Next</button>
        </div>
    );
};

export default PaginationComponent;