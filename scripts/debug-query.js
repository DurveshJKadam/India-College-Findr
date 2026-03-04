require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'india_college_finder.db');

async function debugQuery() {
  const db = new sqlite3.Database(dbPath);
  
  console.log('🔍 Debugging the GROUP_CONCAT query...\n');
  
  // Test 1: Check if mappings exist for a specific college
  console.log('1️⃣ Checking mappings for COEP...');
  
  const coepCollege = await new Promise((resolve) => {
    db.get("SELECT * FROM colleges WHERE college_name LIKE '%COEP%' LIMIT 1", (err, row) => {
      resolve(row);
    });
  });
  
  if (coepCollege) {
    console.log('Found COEP:', coepCollege.college_name, 'ID:', coepCollege.college_id);
    
    const mappings = await new Promise((resolve) => {
      db.all("SELECT * FROM college_courses WHERE college_id = ?", [coepCollege.college_id], (err, rows) => {
        resolve(rows || []);
      });
    });
    
    console.log('Mappings for COEP:', mappings.length);
    
    if (mappings.length > 0) {
      const courseIds = mappings.map(m => m.course_id);
      const courses = await new Promise((resolve) => {
        db.all(`SELECT * FROM courses WHERE course_id IN (${courseIds.join(',')})`, (err, rows) => {
          resolve(rows || []);
        });
      });
      
      console.log('Courses for COEP:', courses.map(c => c.course_name));
    }
  }
  
  // Test 2: Try the exact query step by step
  console.log('\n2️⃣ Testing query components...');
  
  // Simple join without GROUP_CONCAT
  const simpleJoin = await new Promise((resolve) => {
    db.all(`
      SELECT 
        c.college_name,
        co.course_name
      FROM colleges c
      LEFT JOIN college_courses cc ON c.college_id = cc.college_id
      LEFT JOIN courses co ON cc.course_id = co.course_id
      WHERE c.college_name LIKE '%COEP%'
    `, (err, rows) => {
      resolve(rows || []);
    });
  });
  
  console.log('Simple join results:', simpleJoin.length);
  simpleJoin.forEach(row => {
    console.log(`  ${row.college_name} -> ${row.course_name || 'NULL'}`);
  });
  
  // Test 3: Try GROUP_CONCAT with different syntax
  console.log('\n3️⃣ Testing GROUP_CONCAT...');
  
  const groupConcatTest = await new Promise((resolve) => {
    db.get(`
      SELECT 
        c.college_name,
        GROUP_CONCAT(co.course_name) as courses
      FROM colleges c
      LEFT JOIN college_courses cc ON c.college_id = cc.college_id
      LEFT JOIN courses co ON cc.course_id = co.course_id
      WHERE c.college_name LIKE '%COEP%'
      GROUP BY c.college_id
    `, (err, row) => {
      resolve(row);
    });
  });
  
  console.log('GROUP_CONCAT result:', groupConcatTest);
  
  // Test 4: Check if there are any mappings at all
  console.log('\n4️⃣ Checking total mappings...');
  
  const totalMappings = await new Promise((resolve) => {
    db.get('SELECT COUNT(*) as count FROM college_courses', (err, row) => {
      resolve(row.count);
    });
  });
  
  console.log('Total mappings in database:', totalMappings);
  
  // Test 5: Sample some mappings
  const sampleMappings = await new Promise((resolve) => {
    db.all(`
      SELECT 
        c.college_name,
        co.course_name
      FROM college_courses cc
      JOIN colleges c ON cc.college_id = c.college_id
      JOIN courses co ON cc.course_id = co.course_id
      LIMIT 5
    `, (err, rows) => {
      resolve(rows || []);
    });
  });
  
  console.log('\nSample working mappings:');
  sampleMappings.forEach(mapping => {
    console.log(`  ${mapping.college_name} -> ${mapping.course_name}`);
  });
  
  db.close();
}

debugQuery().catch(console.error);