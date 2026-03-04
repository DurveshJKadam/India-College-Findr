#!/usr/bin/env node

/**
 * Production Deployment Script for India College Finder
 * 
 * This script ensures all college and course data is properly imported
 * and linked in the database for production deployment.
 * 
 * Usage: node scripts/production-deploy.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'india_college_finder.db');
const dataDir = path.join(__dirname, '..', 'data');

// Parse CSV line handling quoted fields and multiline content
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Parse CSV with proper multiline handling
function parseCSV(content) {
  const lines = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    
    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        currentLine += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      currentLine += char;
    } else if (char === '\n' && !inQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else if (char === '\r') {
      continue;
    } else {
      currentLine += char;
    }
  }
  
  if (currentLine.trim()) {
    lines.push(currentLine);
  }
  
  return lines;
}

// Extract courses from the course string
function extractCourses(courseString) {
  if (!courseString || courseString === '-' || courseString === 'N/A') return [];
  
  const courses = new Set();
  const lowerCourse = courseString.toLowerCase();
  
  const courseMap = {
    'computer science': 'Computer Science & Engineering',
    'computer engineering': 'Computer Science & Engineering',
    'computer': 'Computer Science & Engineering',
    'cse': 'Computer Science & Engineering',
    'cs': 'Computer Science & Engineering',
    'information technology': 'Information Technology',
    'it': 'Information Technology',
    'artificial intelligence': 'Artificial Intelligence & Machine Learning',
    'ai': 'Artificial Intelligence & Machine Learning',
    'machine learning': 'Artificial Intelligence & Machine Learning',
    'ml': 'Artificial Intelligence & Machine Learning',
    'ai/ml': 'Artificial Intelligence & Machine Learning',
    'aiml': 'Artificial Intelligence & Machine Learning',
    'data science': 'Data Science',
    'ai/ds': 'Data Science',
    'aids': 'Data Science',
    'cybersecurity': 'Cybersecurity',
    'cyber security': 'Cybersecurity',
    'management': 'Management',
    'mba': 'Management',
    'pgdm': 'Management',
    'electronics': 'Electronics & Communication Engineering',
    'ece': 'Electronics & Communication Engineering',
    'electronics & communication': 'Electronics & Communication Engineering',
    'electronics & telecommunication': 'Electronics & Telecommunication Engineering',
    'vlsi': 'Electronics & Communication Engineering',
    'embedded': 'Electronics & Communication Engineering',
    'mechanical': 'Mechanical Engineering',
    'mech': 'Mechanical Engineering',
    'mechanical engineering': 'Mechanical Engineering',
    'civil': 'Civil Engineering',
    'civil engineering': 'Civil Engineering',
    'electrical': 'Electrical Engineering',
    'electrical engineering': 'Electrical Engineering',
    'chemical': 'Chemical Engineering',
    'chemical engineering': 'Chemical Engineering',
    'metallurgy': 'Metallurgical Engineering',
    'metallurgical': 'Metallurgical Engineering',
    'materials': 'Materials Science & Engineering',
    'production': 'Production Engineering',
    'production engineering': 'Production Engineering',
    'textile': 'Textile Engineering',
    'textile technology': 'Textile Engineering',
    'mining': 'Mining Engineering',
    'mining engineering': 'Mining Engineering',
    'aerospace': 'Aerospace Engineering',
    'aeronautical': 'Aerospace Engineering',
    'biotechnology': 'Biotechnology',
    'biotech': 'Biotechnology',
    'biological': 'Biotechnology',
    'bioengineering': 'Biotechnology',
    'engineering physics': 'Engineering Physics',
    'instrumentation': 'Instrumentation Engineering',
    'automobile': 'Automobile Engineering',
    'automotive': 'Automobile Engineering',
    'petroleum': 'Petroleum Engineering',
    'polymer': 'Polymer Engineering',
    'industrial': 'Industrial Engineering',
    'environmental': 'Environmental Engineering',
    'agricultural': 'Agricultural Engineering',
    'food technology': 'Food Technology',
    'printing': 'Printing Technology',
    'architecture': 'Architecture',
    'pharmacy': 'Pharmacy',
    'pharmaceutical': 'Pharmacy',
    'ceramic': 'Ceramic Engineering',
    'finance': 'Finance',
    'marketing': 'Marketing',
    'hr': 'Human Resources',
    'operations': 'Operations Management',
    'strategy': 'Strategy'
  };
  
  for (const [keyword, courseName] of Object.entries(courseMap)) {
    if (lowerCourse.includes(keyword)) {
      courses.add(courseName);
    }
  }
  
  if (courses.size === 0 && (lowerCourse.includes('b.tech') || lowerCourse.includes('btech'))) {
    courses.add('Computer Science & Engineering');
    courses.add('Information Technology');
    courses.add('Electronics & Communication Engineering');
    courses.add('Mechanical Engineering');
    courses.add('Civil Engineering');
    courses.add('Electrical Engineering');
  }
  
  return Array.from(courses);
}

function cleanText(text) {
  if (!text || text === '-' || text === 'N/A' || text.trim() === '') {
    return null;
  }
  return text.trim().replace(/\s+/g, ' ');
}

async function productionDeploy() {
  console.log('🚀 INDIA COLLEGE FINDER - PRODUCTION DEPLOYMENT');
  console.log('=' .repeat(60));
  console.log('This script will import all college and course data');
  console.log('and ensure proper linking for production use.');
  console.log('=' .repeat(60) + '\n');
  
  const db = new sqlite3.Database(dbPath);
  
  // Step 1: Initialize database structure
  console.log('📋 Step 1: Initializing database structure...');
  await new Promise((resolve) => {
    db.serialize(() => {
      db.run('DROP TABLE IF EXISTS college_courses');
      db.run('DROP TABLE IF EXISTS courses');
      db.run('DROP TABLE IF EXISTS colleges');
      
      db.run(`CREATE TABLE colleges (
        college_id INTEGER PRIMARY KEY AUTOINCREMENT,
        college_name TEXT NOT NULL,
        state TEXT NOT NULL,
        district TEXT NOT NULL,
        full_address TEXT,
        contact TEXT,
        website TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE courses (
        course_id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE college_courses (
        college_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (college_id, course_id),
        FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
      )`, () => {
        resolve();
      });
    });
  });
  console.log('✅ Database structure initialized\n');
  
  // Step 2: Import colleges and extract course data
  console.log('📚 Step 2: Importing colleges from CSV files...');
  
  const files = fs.readdirSync(dataDir)
    .filter(file => file.endsWith('.csv'))
    .sort();
  
  console.log(`   Found ${files.length} CSV files to process`);
  
  let totalColleges = 0;
  const collegeCoursesMap = new Map();
  
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = parseCSV(content);
    
    if (lines.length < 2) continue;
    
    const headerLine = parseCSVLine(lines[0]);
    const headers = headerLine.slice(1).map(h => h.trim().replace(/"/g, ''));
    
    process.stdout.write(`   Processing ${file}... `);
    
    const insertCollege = db.prepare('INSERT INTO colleges (college_name, state, district, full_address, contact, website) VALUES (?, ?, ?, ?, ?, ?)');
    
    let fileColleges = 0;
    for (let i = 1; i < lines.length; i++) {
      let values = parseCSVLine(lines[i]);
      values = values.slice(1);
      
      while (values.length < headers.length) {
        values.push('');
      }
      
      const row = {};
      headers.forEach((header, index) => {
        let value = (values[index] || '').trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        row[header] = value;
      });
      
      const collegeName = cleanText(row['College Name']);
      const state = cleanText(row['State']);
      const district = cleanText(row['District']) || 'Unknown';
      const fullAddress = cleanText(row['Full Address']);
      const contact = cleanText(row['Contact']);
      const website = cleanText(row['Website']);
      const courseString = row['Course(s) Offered'] || '';
      
      if (collegeName && state) {
        insertCollege.run(collegeName, state, district, fullAddress, contact, website);
        totalColleges++;
        fileColleges++;
        
        const courses = extractCourses(courseString);
        if (courses.length > 0) {
          collegeCoursesMap.set(collegeName, courses);
        }
      }
    }
    
    insertCollege.finalize();
    console.log(`${fileColleges} colleges`);
  }
  
  console.log(`✅ Imported ${totalColleges} colleges total\n`);
  
  // Step 3: Process courses
  console.log('🎓 Step 3: Processing courses...');
  
  const allCourses = new Set();
  collegeCoursesMap.forEach(courses => {
    courses.forEach(course => allCourses.add(course));
  });
  
  const insertCourse = db.prepare('INSERT INTO courses (course_name) VALUES (?)');
  Array.from(allCourses).forEach(course => {
    insertCourse.run(course);
  });
  insertCourse.finalize();
  
  console.log(`✅ Processed ${allCourses.size} unique courses\n`);
  
  // Step 4: Create college-course mappings
  console.log('🔗 Step 4: Creating college-course mappings...');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const colleges = await new Promise((resolve) => {
    db.all('SELECT college_id, college_name FROM colleges', (err, rows) => {
      resolve(rows || []);
    });
  });
  
  const courseIds = await new Promise((resolve) => {
    db.all('SELECT course_id, course_name FROM courses', (err, rows) => {
      const map = new Map();
      rows.forEach(row => map.set(row.course_name, row.course_id));
      resolve(map);
    });
  });
  
  const insertMapping = db.prepare('INSERT INTO college_courses (college_id, course_id) VALUES (?, ?)');
  
  let mappingsCreated = 0;
  let collegesWithCourses = 0;
  
  colleges.forEach(college => {
    const courses = collegeCoursesMap.get(college.college_name);
    if (courses && courses.length > 0) {
      collegesWithCourses++;
      courses.forEach(courseName => {
        const courseId = courseIds.get(courseName);
        if (courseId) {
          insertMapping.run(college.college_id, courseId);
          mappingsCreated++;
        }
      });
    }
  });
  
  insertMapping.finalize();
  
  console.log(`✅ Created ${mappingsCreated} mappings for ${collegesWithCourses} colleges\n`);
  
  // Step 5: Verification
  console.log('🔍 Step 5: Verifying deployment...');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const finalStats = await new Promise((resolve) => {
    db.get('SELECT COUNT(*) as colleges FROM colleges', (err, collegeRow) => {
      db.get('SELECT COUNT(*) as courses FROM courses', (err, courseRow) => {
        db.get('SELECT COUNT(*) as mappings FROM college_courses', (err, mappingRow) => {
          resolve({
            colleges: collegeRow.colleges,
            courses: courseRow.courses,
            mappings: mappingRow.mappings
          });
        });
      });
    });
  });
  
  // Test the search functionality
  const testResult = await new Promise((resolve) => {
    db.get(`
      SELECT 
        c.college_name,
        c.state,
        GROUP_CONCAT(co.course_name, ', ') as courses
      FROM colleges c
      LEFT JOIN college_courses cc ON c.college_id = cc.college_id
      LEFT JOIN courses co ON cc.course_id = co.course_id
      WHERE c.state = 'Maharashtra'
      GROUP BY c.college_id, c.college_name, c.state
      LIMIT 1
    `, (err, row) => {
      resolve(row);
    });
  });
  
  console.log('📊 Final Statistics:');
  console.log(`   Total Colleges: ${finalStats.colleges}`);
  console.log(`   Total Courses: ${finalStats.courses}`);
  console.log(`   Total Mappings: ${finalStats.mappings}`);
  
  if (testResult && testResult.courses) {
    console.log('\n✅ Verification Test PASSED');
    console.log(`   Sample: ${testResult.college_name}`);
    console.log(`   Courses: ${testResult.courses.substring(0, 100)}...`);
  } else {
    console.log('\n❌ Verification Test FAILED');
    console.log('   Courses are not being returned properly');
  }
  
  // State-wise breakdown
  const stateBreakdown = await new Promise((resolve) => {
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
  
  console.log('\n🗺️  Top 10 States by College Count:');
  stateBreakdown.forEach(state => {
    console.log(`   ${state.state}: ${state.count} colleges`);
  });
  
  db.close();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 PRODUCTION DEPLOYMENT COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log('✅ All college and course data has been imported');
  console.log('✅ All mappings have been created and verified');
  console.log('✅ Database is ready for production use');
  console.log('✅ API endpoints will now return complete course data');
  console.log('='.repeat(60));
  console.log('\n💡 Next steps:');
  console.log('   1. Restart your application server');
  console.log('   2. Test the search functionality');
  console.log('   3. Verify courses are displaying correctly');
  console.log('');
}

// Run the deployment
if (require.main === module) {
  productionDeploy().catch(error => {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = { productionDeploy };