import React from 'react';
import Header from './components/Header';
import SearchSection from './components/SearchSection';

function App() {
  return (
    <div className="App">
      <Header />
      <div className="container">
        <SearchSection />
      </div>
    </div>
  );
}

export default App;