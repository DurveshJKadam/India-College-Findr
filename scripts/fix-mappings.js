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

async function fixMappings() {
  console.log('🔧 Fixing college-course mappings...\n');
  
  const db = new sqlite3.Database(dbPath);
  
  // Step 1: Clear existing mappings
  console.log('1️⃣ Clearing existing mappings...');
  await new Promise((resolve) => {
    db.run('DELETE FROM college_courses', () => {
      resolve();
    });
  });
  
  // Step 2: Build college-course mapping from CSV files
  console.log('2️⃣ Building mappings from CSV data...');
  
  const files = fs.readdirSync(dataDir)
    .filter(file => file.endsWith('.csv'))
    .sort();
  
  const collegeCoursesMap = new Map();
  
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = parseCSV(content);
    
    if (lines.length < 2) continue;
    
    const headerLine = parseCSVLine(lines[0]);
    const headers = headerLine.slice(1).map(h => h.trim().replace(/"/g, ''));
    
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
      
      const collegeName = row['College Name']?.trim();
      const courseString = row['Course(s) Offered'] || '';
      
      if (collegeName && courseString) {
        const courses = extractCourses(courseString);
        if (courses.length > 0) {
          collegeCoursesMap.set(collegeName, courses);
        }
      }
    }
  }
  
  console.log(`   Found course data for ${collegeCoursesMap.size} colleges`);
  
  // Step 3: Get all colleges and courses from database
  console.log('3️⃣ Getting database data...');
  
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
  
  console.log(`   Found ${colleges.length} colleges in database`);
  console.log(`   Found ${courseIds.size} courses in database`);
  
  // Step 4: Create mappings
  console.log('4️⃣ Creating new mappings...');
  
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
  
  console.log(`   Created ${mappingsCreated} mappings for ${collegesWithCourses} colleges`);
  
  // Step 5: Verify the fix
  console.log('5️⃣ Verifying the fix...');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
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
  
  if (testResult && testResult.courses) {
    console.log(`✅ Success! Test college: ${testResult.college_name}`);
    console.log(`   Courses: ${testResult.courses}`);
  } else {
    console.log('❌ Still having issues with course display');
  }
  
  // Final stats
  const finalStats = await new Promise((resolve) => {
    db.get('SELECT COUNT(*) as count FROM college_courses', (err, row) => {
      resolve(row.count);
    });
  });
  
  console.log(`\n📊 Final mapping count: ${finalStats}`);
  
  db.close();
  
  console.log('\n✅ Mapping fix completed!');
}

fixMappings().catch(console.error);