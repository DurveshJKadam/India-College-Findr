const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'india_college_finder.db');
const dataDir = path.join(__dirname, '..', 'data');

const db = new sqlite3.Database(dbPath);

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
  
  // Handle PGDM and MBA explicitly
  if (lowerCourse.includes('pgdm') || (lowerCourse.includes('mba') && !lowerCourse.includes('b.tech'))) {
    courses.add('Management');
  }
  
  // Handle M.Tech and other postgraduate programs
  if (lowerCourse.includes('m.tech') || lowerCourse.includes('mtech') || lowerCourse.includes('m tech')) {
    // If specific specialization mentioned, add it
    if (lowerCourse.includes('vlsi')) {
      courses.add('Electronics');
    }
    if (lowerCourse.includes('embedded')) {
      courses.add('Electronics');
    }
    if (lowerCourse.includes('computer') || lowerCourse.includes('cs')) {
      courses.add('Computer Engineering');
    }
    // If no specific specialization, add common engineering courses
    if (courses.size === 0) {
      courses.add('Computer Engineering');
      courses.add('Electronics');
    }
  }
  
  // Comprehensive course mappings
  const courseMap = {
    'computer science': 'Computer Engineering',
    'computer engineering': 'Computer Engineering',
    'computer': 'Computer Engineering',
    'cse': 'Computer Engineering',
    'cs': 'Computer Engineering',
    'information technology': 'Information Technology',
    'it': 'Information Technology',
    'artificial intelligence': 'Artificial Intelligence & Machine Learning (AI/ML)',
    'ai': 'Artificial Intelligence & Machine Learning (AI/ML)',
    'machine learning': 'Artificial Intelligence & Machine Learning (AI/ML)',
    'ml': 'Artificial Intelligence & Machine Learning (AI/ML)',
    'ai/ml': 'Artificial Intelligence & Machine Learning (AI/ML)',
    'aiml': 'Artificial Intelligence & Machine Learning (AI/ML)',
    'data science': 'Artificial Intelligence & Data Science (AI/DS)',
    'ai/ds': 'Artificial Intelligence & Data Science (AI/DS)',
    'aids': 'Artificial Intelligence & Data Science (AI/DS)',
    'cybersecurity': 'Cybersecurity',
    'cyber security': 'Cybersecurity',
    'management': 'Management',
    'mba': 'Management',
    'electronics': 'Electronics',
    'ece': 'Electronics',
    'electronics & communication': 'Electronics',
    'electronics & telecommunication': 'Electronics',
    'vlsi': 'Electronics',
    'embedded': 'Electronics',
    'mechanical': 'Mechanical',
    'mech': 'Mechanical',
    'mechanical engineering': 'Mechanical',
    'civil': 'Civil Engineering',
    'civil engineering': 'Civil Engineering',
    'electrical': 'Electrical Engineering',
    'electrical engineering': 'Electrical Engineering',
    'chemical': 'Chemical Engineering',
    'chemical engineering': 'Chemical Engineering',
    'metallurgy': 'Metallurgical Engineering',
    'metallurgical': 'Metallurgical Engineering',
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
    'engineering physics': 'Engineering Physics',
    'instrumentation': 'Instrumentation Engineering',
    'automobile': 'Automobile Engineering',
    'automotive': 'Automobile Engineering',
    'petroleum': 'Petroleum Engineering',
    'polymer': 'Polymer Engineering',
    'materials': 'Materials Engineering',
    'industrial': 'Industrial Engineering',
    'environmental': 'Environmental Engineering',
    'agricultural': 'Agricultural Engineering',
    'food technology': 'Food Technology',
    'printing': 'Printing Technology',
    'architecture': 'Architecture',
    'pharmacy': 'Pharmacy',
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
    courses.add('Computer Engineering');
    courses.add('Information Technology');
    courses.add('Electronics');
    courses.add('Mechanical');
  }
  
  return Array.from(courses);
}

// Clean text data
function cleanText(text) {
  if (!text || text === '-' || text === 'N/A' || text.trim() === '') {
    return null;
  }
  return text.trim().replace(/\s+/g, ' ');
}

async function clearDatabase() {
  return new Promise((resolve) => {
    db.serialize(() => {
      // Create tables first
      db.run(`CREATE TABLE IF NOT EXISTS colleges (
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
      
      db.run(`CREATE TABLE IF NOT EXISTS courses (
        course_id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS college_courses (
        college_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (college_id, course_id),
        FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
      )`);
      
      // Clear existing data
      db.run('DELETE FROM college_courses', (err) => {
        if (err) console.log('No college_courses to delete');
      });
      db.run('DELETE FROM colleges', (err) => {
        if (err) console.log('No colleges to delete');
      });
      db.run('DELETE FROM courses', (err) => {
        if (err) console.log('No courses to delete');
        else resolve();
      });
    });
  });
}

async function importCSVFile(filePath) {
  return new Promise((resolve) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = parseCSV(content);
    
    if (lines.length < 2) {
      console.log(`Skipping ${path.basename(filePath)} - no data`);
      return resolve();
    }
    
    const headers = parseCSVLine(lines[0]);
    const data = [];
    
    // Parse all data rows
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index] || '';
      });
      data.push(row);
    }
    
    console.log(`Importing ${data.length} colleges from ${path.basename(filePath)}...`);
    
    let imported = 0;
    let skipped = 0;
    const insertCollege = db.prepare('INSERT INTO colleges (college_name, state, district, full_address, contact, website) VALUES (?, ?, ?, ?, ?, ?)');
    
    data.forEach((row, index) => {
      const collegeName = cleanText(row['College Name']);
      const state = cleanText(row['State']);
      const district = cleanText(row['District']);
      const fullAddress = cleanText(row['Full Address']);
      const contact = cleanText(row['Contact']);
      const website = cleanText(row['Website']);
      const courseString = row['Course(s) Offered'] || '';
      
      if (!collegeName || !state) {
        skipped++;
        return;
      }
      
      insertCollege.run(collegeName, state, district, fullAddress, contact, website, function(err) {
        if (err) {
          console.error(`Error inserting ${collegeName}:`, err.message);
          skipped++;
        } else {
          imported++;
          const collegeId = this.lastID;
          const courses = extractCourses(courseString);
          
          // Insert courses and link them
          courses.forEach(courseName => {
            db.run('INSERT OR IGNORE INTO courses (course_name) VALUES (?)', [courseName], function(err) {
              if (err) return;
              
              db.get('SELECT course_id FROM courses WHERE course_name = ?', [courseName], (err, course) => {
                if (!err && course) {
                  db.run('INSERT OR IGNORE INTO college_courses (college_id, course_id) VALUES (?, ?)', 
                    [collegeId, course.course_id]);
                }
              });
            });
          });
          
          // Log progress every 50 records
          if (imported % 50 === 0) {
            console.log(`  Progress: ${imported} colleges imported...`);
          }
        }
      });
    });
    
    insertCollege.finalize(() => {
      console.log(`✓ Imported ${imported} colleges from ${path.basename(filePath)}`);
      if (skipped > 0) {
        console.log(`  (Skipped ${skipped} invalid records)`);
      }
      resolve();
    });
  });
}

async function importAllFiles() {
  try {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║     India College Finder - Complete Data Import               ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await clearDatabase();
    console.log('✓ Database cleared\n');
    
    // Get all CSV files
    const files = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.csv'))
      .sort();
    
    console.log(`Found ${files.length} CSV files to import\n`);
    console.log('─'.repeat(70) + '\n');
    
    // Import each file sequentially
    for (let i = 0; i < files.length; i++) {
      console.log(`[${i + 1}/${files.length}] Processing: ${files[i]}`);
      await importCSVFile(path.join(dataDir, files[i]));
      console.log('');
    }
    
    // Wait a bit for all async operations to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show comprehensive summary
    console.log('═'.repeat(70));
    console.log('                    IMPORT SUMMARY');
    console.log('═'.repeat(70) + '\n');
    
    db.get('SELECT COUNT(*) as count FROM colleges', (err, row) => {
      if (!err) {
        console.log(`✓ Total colleges imported: ${row.count}`);
      }
    });
    
    db.get('SELECT COUNT(*) as count FROM courses', (err, row) => {
      if (!err) {
        console.log(`✓ Total unique courses: ${row.count}`);
      }
    });
    
    db.get('SELECT COUNT(*) as count FROM college_courses', (err, row) => {
      if (!err) {
        console.log(`✓ Total college-course mappings: ${row.count}\n`);
      }
    });
    
    // Show state-wise breakdown
    db.all('SELECT state, COUNT(*) as count FROM colleges GROUP BY state ORDER BY count DESC', (err, rows) => {
      if (!err && rows) {
        console.log('State-wise College Distribution:');
        console.log('─'.repeat(70));
        rows.forEach(row => {
          console.log(`  ${row.state.padEnd(40)} : ${row.count} colleges`);
        });
      }
      
      console.log('\n' + '═'.repeat(70));
      console.log('✓ Import completed successfully!');
      console.log('═'.repeat(70) + '\n');
      
      db.close();
    });
    
  } catch (error) {
    console.error('Import failed:', error);
    db.close();
    process.exit(1);
  }
}

importAllFiles();
