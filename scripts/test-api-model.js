require('dotenv').config();
const College = require('../src/models/College');

async function testCollegeModel() {
  console.log('Testing College model directly...\n');
  
  try {
    // Test the search method
    console.log('Testing search with Maharashtra filter...');
    const results = await College.search({ state: 'Maharashtra' });
    
    console.log(`Found ${results.length} colleges`);
    
    if (results.length > 0) {
      console.log('\nFirst few results:');
      results.slice(0, 3).forEach((college, index) => {
        console.log(`${index + 1}. ${college.college_name}`);
        console.log(`   State: ${college.state}`);
        console.log(`   District: ${college.district}`);
        console.log(`   Courses: ${college.courses || 'NULL'}`);
        console.log('');
      });
    }
    
    // Test getting all states
    console.log('Testing getStates...');
    const states = await College.getStates();
    console.log(`Found ${states.length} states:`, states.slice(0, 5));
    
    // Test getting all courses
    console.log('\nTesting getCourses...');
    const courses = await College.getCourses();
    console.log(`Found ${courses.length} courses:`, courses.slice(0, 5));
    
  } catch (error) {
    console.error('Error testing College model:', error);
  }
  
  process.exit(0);
}

testCollegeModel();