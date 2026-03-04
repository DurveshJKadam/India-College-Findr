const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'india_college_finder.db');
const dataDir = path.join(__dirname, '..', 'data');

const db = new sqlite3.Database(dbPath);

// Parse CSV line handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
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

// Extract courses from the course string
function extractCourses(courseString) {
  if (!courseString) return [];
  
  const courses = new Set();
  const lowerCourse = courseString.toLowerCase();
  
  // Define course mappings
  const courseMap = {
    'computer': 'Computer Engineering',
    'information technology': 'Information Technology',
    'it': 'Information Technology',
    'artificial intelligence': 'Artificial Intelligence & Machine Learning (AI/ML)',
    'ai': 'Artificial Intelligence & Machine Learning (AI/ML)',
    'machine learning': 'Artificial Intelligence & Machine Learning (AI/ML)',
    'ml': 'Artificial Intelligence & Machine Learning (AI/ML)',
    'data science': 'Artificial Intelligence & Data Science (AI/DS)',
    'cybersecurity': 'Cybersecurity',
    'cyber security': 'Cybersecurity',
    'management': 'Management',
    'mba': 'Management',
    'electronics': 'Electronics',
    'mechanical': 'Mechanical',
    'civil': 'Civil Engineering',
    'electrical': 'Electrical Engineering',
    'chemical': 'Chemical Engineering'
  };
  
  for (const [keyword, courseName] of Object.entries(courseMap)) {
    if (lowerCourse.includes(keyword)) {
      courses.add(courseName);
    }
  }
  
  return Array.from(courses);
}

async function clearDatabase() {
  return new Promise((resolve, reject) => {
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
  return new Promise((resolve, reject) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      console.log(`Skipping ${path.basename(filePath)} - no data`);
      return resolve();
    }
    
    const headers = parseCSVLine(lines[0]);
    const data = [];
    
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
    const insertCollege = db.prepare('INSERT INTO colleges (college_name, state, district, full_address, contact, website) VALUES (?, ?, ?, ?, ?, ?)');
    
    data.forEach(row => {
      const collegeName = row['College Name'] || '';
      const state = row['State'] || '';
      const district = row['District'] || '';
      const fullAddress = row['Full Address'] || '';
      const contact = row['Contact'] || '';
      const website = row['Website'] || '';
      
      if (collegeName && state) {
        insertCollege.run(collegeName, state, district, fullAddress, contact, website, function(err) {
          if (err) {
            console.error(`Error inserting ${collegeName}:`, err.message);
          } else {
            imported++;
            const collegeId = this.lastID;
            const courseString = row['Course(s) Offered'] || '';
            const courses = extractCourses(courseString);
            
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
          }
        });
      }
    });
    
    insertCollege.finalize(() => {
      console.log(`✓ Imported ${imported} colleges from ${path.basename(filePath)}`);
      resolve();
    });
  });
}

async function importAllFiles() {
  try {
    console.log('Starting data import...\n');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await clearDatabase();
    console.log('✓ Database cleared\n');
    
    // Get all CSV files
    const files = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.csv'))
      .sort();
    
    console.log(`Found ${files.length} CSV files\n`);
    
    // Import each file
    for (const file of files) {
      await importCSVFile(path.join(dataDir, file));
    }
    
    // Show summary
    db.get('SELECT COUNT(*) as count FROM colleges', (err, row) => {
      if (!err) {
        console.log(`\n✓ Total colleges imported: ${row.count}`);
      }
    });
    
    db.get('SELECT COUNT(*) as count FROM courses', (err, row) => {
      if (!err) {
        console.log(`✓ Total unique courses: ${row.count}`);
      }
    });
    
    db.get('SELECT COUNT(*) as count FROM college_courses', (err, row) => {
      if (!err) {
        console.log(`✓ Total college-course mappings: ${row.count}`);
      }
      
      console.log('\n✓ Import completed successfully!');
      db.close();
    });
    
  } catch (error) {
    console.error('Import failed:', error);
    db.close();
    process.exit(1);
  }
}

importAllFiles();
