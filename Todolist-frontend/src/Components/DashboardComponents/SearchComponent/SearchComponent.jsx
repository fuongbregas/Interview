import React from 'react';
import './SearchComponent.css';

const SearchComponent = ({ value, onChange }) => {
	return (
		<div className="dash-search-wrap">
			<input
				type="text"
				className="dash-search-input"
				placeholder="Search by todo name or description"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	);
};

export default SearchComponent;
