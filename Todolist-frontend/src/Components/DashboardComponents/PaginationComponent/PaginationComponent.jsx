import React from 'react';
import './PaginationComponent.css';

const PaginationComponent = ({ currentPage, totalPages, onPrev, onNext }) => {
    if (!totalPages || totalPages <= 1) return null;

    return (
        <div className="dash-pagination">
            <button
                type="button"
                className="dash-pagination-btn"
                onClick={onPrev}
                disabled={currentPage === 1}
            >Prev</button>
            <div className="dash-pageInfo">
                Page {currentPage} of {totalPages}
            </div>
            <button
                type="button"
                className="dash-pagination-btn"
                onClick={onNext}
                disabled={currentPage === totalPages}
            >Next</button>
        </div>
    );
};

export default PaginationComponent;