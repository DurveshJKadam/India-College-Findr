const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'india_college_finder.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking course data in database...\n');

// Check total colleges
db.get('SELECT COUNT(*) as count FROM colleges', (err, row) => {
  if (!err) {
    console.log(`Total colleges: ${row.count}`);
  }
});

// Check total courses
db.get('SELECT COUNT(*) as count FROM courses', (err, row) => {
  if (!err) {
    console.log(`Total courses: ${row.count}`);
  }
});

// Check total mappings
db.get('SELECT COUNT(*) as count FROM college_courses', (err, row) => {
  if (!err) {
    console.log(`Total college-course mappings: ${row.count}\n`);
  }
});

// Check colleges WITHOUT any courses
db.get(`
  SELECT COUNT(*) as count 
  FROM colleges c 
  WHERE NOT EXISTS (
    SELECT 1 FROM college_courses cc WHERE cc.college_id = c.college_id
  )
`, (err, row) => {
  if (!err) {
    console.log(`Colleges WITHOUT any courses: ${row.count}\n`);
  }
});

// Show sample colleges with their courses
db.all(`
  SELECT 
    c.college_name,
    c.state,
    GROUP_CONCAT(co.course_name, ', ') as courses
  FROM colleges c
  LEFT JOIN college_courses cc ON c.college_id = cc.college_id
  LEFT JOIN courses co ON cc.course_id = co.course_id
  GROUP BY c.college_id
  LIMIT 20
`, (err, rows) => {
  if (!err) {
    console.log('Sample colleges with courses:');
    console.log('─'.repeat(100));
    rows.forEach(row => {
      const courses = row.courses || 'N/A';
      console.log(`${row.college_name.substring(0, 50).padEnd(50)} | ${courses}`);
    });
  }
  
  db.close();
});
