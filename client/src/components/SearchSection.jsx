import React, { useState, useEffect } from 'react';
import SearchFilters from './SearchFilters';
import SearchResults from './SearchResults';
import { searchColleges } from '../services/api';

const SearchSection = () => {
  const [filters, setFilters] = useState({
    state: 'All',
    district: 'All',
    course: ''
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const searchParams = {};
      if (filters.state && filters.state !== 'All') {
        searchParams.state = filters.state;
      }
      if (filters.district && filters.district !== 'All') {
        searchParams.district = filters.district;
      }
      if (filters.course && filters.course !== '') {
        searchParams.course = filters.course;
      }

      const response = await searchColleges(searchParams);
      if (response.success) {
        setResults(response.data);
      } else {
        setError('Failed to search colleges. Please try again.');
        setResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Auto-search when filters change (after initial load)
  useEffect(() => {
    if (hasSearched) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [filters]);

  return (
    <div className="search-section">
      <SearchFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        loading={loading}
      />
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <SearchResults 
        results={results}
        loading={loading}
        hasSearched={hasSearched}
      />
    </div>
  );
};

export default SearchSection;