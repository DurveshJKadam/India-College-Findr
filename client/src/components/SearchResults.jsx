import React from 'react';

const SearchResults = ({ results, loading, hasSearched }) => {
  if (loading) {
    return (
      <div className="results-section">
        <div className="loading">
          <div className="loading-spinner"></div>
          <div>Searching colleges...</div>
        </div>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="results-section">
        <div className="no-results">
          <div className="no-results-icon"></div>
          <div>Use the filters above to search for colleges across India</div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="results-section">
        <div className="no-results">
          <div className="no-results-icon"></div>
          <div>No colleges found matching your criteria.</div>
          <div style={{ fontSize: '1rem', marginTop: '10px', opacity: 0.8 }}>
            Try adjusting your search filters.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-section">
      <div className="results-header">
        <h2>Search Results</h2>
        <span className="results-count">
          {results.length} college{results.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Desktop Table View */}
      <div className="results-table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>College Name</th>
              <th>State</th>
              <th>District</th>
              <th>Courses Offered</th>
              <th>Address</th>
              <th>Contact</th>
              <th>Website</th>
            </tr>
          </thead>
          <tbody>
            {results.map((college, index) => (
              <tr key={`${college.college_id}-${index}`}>
                <td>
                  <div className="college-name">{college.college_name}</div>
                </td>
                <td>{college.state}</td>
                <td>{college.district}</td>
                <td>
                  <div className="college-courses">
                    {college.courses || <span className="no-data">N/A</span>}
                  </div>
                </td>
                <td>
                  <div className="college-address">
                    {college.full_address || <span className="no-data">N/A</span>}
                  </div>
                </td>
                <td>
                  <div className="college-contact">
                    {college.contact || <span className="no-data">N/A</span>}
                  </div>
                </td>
                <td>
                  {college.website ? (
                    <a 
                      href={college.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="college-website"
                    >
                      Visit Website
                    </a>
                  ) : (
                    <span className="no-data">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="results-card-view">
        {results.map((college, index) => (
          <div key={`${college.college_id}-${index}`} className="college-card">
            <div className="college-card-header">
              <div className="college-card-name">{college.college_name}</div>
              <div className="college-card-location">
                <span>📍 {college.state}</span>
                <span>{college.district}</span>
              </div>
            </div>
            
            <div className="college-card-body">
              {college.courses && (
                <div className="college-card-field">
                  <div className="college-card-label">Courses Offered</div>
                  <div className="college-card-value college-courses">
                    {college.courses}
                  </div>
                </div>
              )}
              
              {college.full_address && (
                <div className="college-card-field">
                  <div className="college-card-label">Address</div>
                  <div className="college-card-value">
                    {college.full_address}
                  </div>
                </div>
              )}
              
              {college.contact && (
                <div className="college-card-field">
                  <div className="college-card-label">Contact</div>
                  <div className="college-card-value">
                    {college.contact}
                  </div>
                </div>
              )}
              
              {college.website && (
                <div className="college-card-field">
                  <div className="college-card-label">Website</div>
                  <div className="college-card-value">
                    <a 
                      href={college.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="college-website"
                    >
                      Visit Website →
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;