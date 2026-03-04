const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('india_college_finder.db');

console.log('Debugging college-course mappings...\n');

// Check specific college
db.get("SELECT * FROM colleges WHERE college_name LIKE '%COEP%' LIMIT 1", (err, college) => {
  if (college) {
    console.log('Found college:', college);
    
    // Check if this college has course mappings
    db.all("SELECT * FROM college_courses WHERE college_id = ?", [college.college_id], (err, mappings) => {
      console.log('Course mappings for this college:', mappings.length);
      
      if (mappings.length > 0) {
        // Get the actual course names
        const courseIds = mappings.map(m => m.course_id).join(',');
        db.all(`SELECT * FROM courses WHERE course_id IN (${courseIds})`, (err, courses) => {
          console.log('Courses:', courses.map(c => c.course_name));
        });
      }
    });
  }
});

// Check a few random mappings
db.all("SELECT * FROM college_courses LIMIT 5", (err, mappings) => {
  console.log('\nSample mappings:', mappings);
});

// Check courses table
db.all("SELECT * FROM courses LIMIT 5", (err, courses) => {
  console.log('\nSample courses:', courses);
});

setTimeout(() => {
  db.close();
}, 2000);