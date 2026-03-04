const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'india_college_finder.db');

async function verifyData() {
  const db = new sqlite3.Database(dbPath);
  
  console.log('🔍 Verifying database data integrity...\n');
  
  // Check colleges
  const collegeCount = await new Promise((resolve) => {
    db.get('SELECT COUNT(*) as count FROM colleges', (err, row) => {
      resolve(row ? row.count : 0);
    });
  });
  
  console.log(`📊 Total colleges: ${collegeCount}`);
  
  // Check courses
  const courseCount = await new Promise((resolve) => {
    db.get('SELECT COUNT(*) as count FROM courses', (err, row) => {
      resolve(row ? row.count : 0);
    });
  });
  
  console.log(`📚 Total courses: ${courseCount}`);
  
  // Check college-course mappings
  const mappingCount = await new Promise((resolve) => {
    db.get('SELECT COUNT(*) as count FROM college_courses', (err, row) => {
      resolve(row ? row.count : 0);
    });
  });
  
  console.log(`🔗 Total college-course mappings: ${mappingCount}`);
  
  // Check colleges without courses
  const collegesWithoutCourses = await new Promise((resolve) => {
    db.get(`
      SELECT COUNT(*) as count 
      FROM colleges c 
      LEFT JOIN college_courses cc ON c.college_id = cc.college_id 
      WHERE cc.college_id IS NULL
    `, (err, row) => {
      resolve(row ? row.count : 0);
    });
  });
  
  console.log(`⚠️  Colleges without courses: ${collegesWithoutCourses}`);
  
  // Sample data check
  console.log('\n📋 Sample college data with courses:');
  const sampleData = await new Promise((resolve) => {
    db.all(`
      SELECT 
        c.college_name,
        c.state,
        c.district,
        GROUP_CONCAT(co.course_name, ', ') as courses
      FROM colleges c
      LEFT JOIN college_courses cc ON c.college_id = cc.college_id
      LEFT JOIN courses co ON cc.course_id = co.course_id
      GROUP BY c.college_id, c.college_name, c.state, c.district
      LIMIT 5
    `, (err, rows) => {
      resolve(rows || []);
    });
  });
  
  sampleData.forEach((college, index) => {
    console.log(`${index + 1}. ${college.college_name} (${college.state})`);
    console.log(`   Courses: ${college.courses || 'N/A'}`);
    console.log('');
  });
  
  // State-wise breakdown
  console.log('🗺️  State-wise college distribution:');
  const stateData = await new Promise((resolve) => {
    db.all(`
      SELECT state, COUNT(*) as count 
      FROM colleges 
      GROUP BY state 
      ORDER BY count DESC 
      LIMIT 10
    `, (err, rows) => {
      resolve(rows || []);
    });
  });
  
  stateData.forEach(state => {
    console.log(`   ${state.state}: ${state.count} colleges`);
  });
  
  // Course distribution
  console.log('\n📖 Most common courses:');
  const courseData = await new Promise((resolve) => {
    db.all(`
      SELECT co.course_name, COUNT(*) as count 
      FROM courses co
      JOIN college_courses cc ON co.course_id = cc.course_id
      GROUP BY co.course_id, co.course_name
      ORDER BY count DESC 
      LIMIT 10
    `, (err, rows) => {
      resolve(rows || []);
    });
  });
  
  courseData.forEach(course => {
    console.log(`   ${course.course_name}: ${course.count} colleges`);
  });
  
  db.close();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📈 SUMMARY');
  console.log('='.repeat(60));
  
  if (collegeCount > 0 && courseCount > 0 && mappingCount > 0) {
    console.log('✅ Database appears to be properly populated');
    if (collegesWithoutCourses > 0) {
      console.log(`⚠️  Warning: ${collegesWithoutCourses} colleges have no course data`);
    }
  } else {
    console.log('❌ Database has missing data:');
    if (collegeCount === 0) console.log('   - No colleges found');
    if (courseCount === 0) console.log('   - No courses found');
    if (mappingCount === 0) console.log('   - No college-course mappings found');
  }
  
  console.log('='.repeat(60));
}

verifyData().catch(console.error);