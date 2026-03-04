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
        // Handle escaped quotes
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
      // Skip carriage returns
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

// Extract courses from the course string with comprehensive mapping
function extractCourses(courseString) {
  if (!courseString || courseString === '-' || courseString === 'N/A') return [];
  
  const courses = new Set();
  const lowerCourse = courseString.toLowerCase();
  
  // Comprehensive course mappings
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
  
  // Check for each course pattern
  for (const [keyword, courseName] of Object.entries(courseMap)) {
    if (lowerCourse.includes(keyword)) {
      courses.add(courseName);
    }
  }
  
  // If B.Tech is mentioned but no specific courses found, add common engineering courses
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

async function processCourses() {
  const db = new sqlite3.Database(dbPath);
  
  console.log('Processing courses for all colleges...');
  
  // Clear existing course data
  await new Promise((resolve) => {
    db.run('DELETE FROM college_courses', () => {
      db.run('DELETE FROM courses', () => {
        resolve();
      });
    });
  });
  
  // Get all CSV files to extract course data
  const files = fs.readdirSync(dataDir)
    .filter(file => file.endsWith('.csv'))
    .sort();
  
  const collegeCoursesMap = new Map();
  
  // Process each CSV file to build course mappings
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
  
  console.log(`Found course data for ${collegeCoursesMap.size} colleges`);
  
  // Get all colleges from database
  const colleges = await new Promise((resolve) => {
    db.all('SELECT college_id, college_name FROM colleges', (err, rows) => {
      resolve(rows || []);
    });
  });
  
  console.log(`Processing courses for ${colleges.length} colleges in database...`);
  
  // Collect all unique courses
  const allCourses = new Set();
  collegeCoursesMap.forEach(courses => {
    courses.forEach(course => allCourses.add(course));
  });
  
  // Insert all courses
  const insertCourse = db.prepare('INSERT OR IGNORE INTO courses (course_name) VALUES (?)');
  Array.from(allCourses).forEach(course => {
    insertCourse.run(course);
  });
  insertCourse.finalize();
  
  console.log(`Inserted ${allCourses.size} unique courses`);
  
  // Wait a bit for course insertion to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get course IDs
  const courseIds = await new Promise((resolve) => {
    db.all('SELECT course_id, course_name FROM courses', (err, rows) => {
      const map = new Map();
      rows.forEach(row => map.set(row.course_name, row.course_id));
      resolve(map);
    });
  });
  
  // Insert college-course mappings
  const insertMapping = db.prepare('INSERT OR IGNORE INTO college_courses (college_id, course_id) VALUES (?, ?)');
  
  let mappingsInserted = 0;
  colleges.forEach(college => {
    const courses = collegeCoursesMap.get(college.college_name);
    if (courses) {
      courses.forEach(courseName => {
        const courseId = courseIds.get(courseName);
        if (courseId) {
          insertMapping.run(college.college_id, courseId);
          mappingsInserted++;
        }
      });
    }
  });
  
  insertMapping.finalize();
  
  console.log(`Inserted ${mappingsInserted} college-course mappings`);
  
  // Show final summary
  setTimeout(() => {
    db.get('SELECT COUNT(*) as count FROM colleges', (err, row) => {
      console.log(`✓ Total colleges: ${row.count}`);
    });
    
    db.get('SELECT COUNT(*) as count FROM courses', (err, row) => {
      console.log(`✓ Total courses: ${row.count}`);
    });
    
    db.get('SELECT COUNT(*) as count FROM college_courses', (err, row) => {
      console.log(`✓ Total college-course mappings: ${row.count}`);
      db.close();
    });
  }, 1000);
}

processCourses().catch(console.error);