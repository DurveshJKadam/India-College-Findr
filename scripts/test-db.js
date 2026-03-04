const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('india_college_finder.db');

console.log('Testing database queries...\n');

// Test 1: Check if data exists
db.get('SELECT COUNT(*) as count FROM colleges', (err, row) => {
  console.log('Total colleges:', row.count);
});

db.get('SELECT COUNT(*) as count FROM courses', (err, row) => {
  console.log('Total courses:', row.count);
});

db.get('SELECT COUNT(*) as count FROM college_courses', (err, row) => {
  console.log('Total mappings:', row.count);
});

// Test 2: Test the exact query used by the API
const query = `
  SELECT DISTINCT 
    c.college_id,
    c.college_name,
    c.state,
    c.district,
    c.full_address,
    c.contact,
    c.website,
    GROUP_CONCAT(co.course_name, ', ') as courses
  FROM colleges c
  LEFT JOIN college_courses cc ON c.college_id = cc.college_id
  LEFT JOIN courses co ON cc.course_id = co.course_id
  WHERE c.state = ?
  GROUP BY c.college_id, c.college_name, c.state, c.district, c.full_address, c.contact, c.website
  ORDER BY c.state, c.district, c.college_name
  LIMIT 2
`;

console.log('\nTesting API query for Maharashtra:');
db.all(query, ['Maharashtra'], (err, rows) => {
  if (err) {
    console.error('Query error:', err);
  } else {
    console.log('Results:', rows.length);
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.college_name}`);
      console.log(`   Courses: ${row.courses || 'NULL'}`);
    });
  }
  
  db.close();
});