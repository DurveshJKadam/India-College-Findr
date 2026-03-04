require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'india_college_finder.db');

async function testExactQuery() {
  const db = new sqlite3.Database(dbPath);
  
  console.log('🔍 Testing the exact query from College model...\n');
  
  // This is the exact query from the College.search method
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
    LIMIT 3
  `;
  
  const results = await new Promise((resolve) => {
    db.all(query, ['Maharashtra'], (err, rows) => {
      if (err) {
        console.error('Query error:', err);
        resolve([]);
      } else {
        resolve(rows || []);
      }
    });
  });
  
  console.log(`Found ${results.length} results:`);
  
  results.forEach((college, index) => {
    console.log(`\n${index + 1}. ${college.college_name}`);
    console.log(`   State: ${college.state}`);
    console.log(`   District: ${college.district}`);
    console.log(`   Courses: ${college.courses || 'NULL'}`);
  });
  
  db.close();
}

testExactQuery().catch(console.error);