import React, { useState, useEffect } from 'react';
import { getStates, getDistricts, getCourses } from '../services/api';

const SearchFilters = ({ filters, onFilterChange, onSearch, loading }) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (filters.state) {
      loadDistricts(filters.state);
    }
  }, [filters.state]);

  const loadInitialData = async () => {
    try {
      const [statesRes, coursesRes] = await Promise.all([
        getStates(),
        getCourses()
      ]);

      if (statesRes.success) {
        setStates(statesRes.data);
      }
      if (coursesRes.success) {
        setCourses(coursesRes.data);
      }

      // Load districts for "All" initially
      await loadDistricts('All');
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadDistricts = async (state) => {
    try {
      const response = await getDistricts(state);
      if (response.success) {
        setDistricts(response.data);
      }
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    
    // Reset district when state changes
    if (field === 'state') {
      newFilters.district = 'All';
    }
    
    onFilterChange(newFilters);
  };

  if (loadingData) {
    return (
      <div className="search-filters">
        <div className="loading">Loading search options...</div>
      </div>
    );
  }

  return (
    <div className="search-filters">
      <div className="filter-group">
        <label htmlFor="state">State</label>
        <select
          id="state"
          value={filters.state}
          onChange={(e) => handleFilterChange('state', e.target.value)}
          disabled={loading}
        >
          {states.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="district">District</label>
        <select
          id="district"
          value={filters.district}
          onChange={(e) => handleFilterChange('district', e.target.value)}
          disabled={loading}
        >
          {districts.map(district => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="course">Course</label>
        <select
          id="course"
          value={filters.course}
          onChange={(e) => handleFilterChange('course', e.target.value)}
          disabled={loading}
        >
          <option value="">All Courses</option>
          {courses.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
      </div>

      <button 
        className="search-button"
        onClick={onSearch}
        disabled={loading}
      >
        {loading ? 'Searching...' : 'Search Colleges'}
      </button>
    </div>
  );
};

export default SearchFilters;