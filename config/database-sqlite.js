const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'india_college_finder.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
      } else {
        console.log('Connected to SQLite database');
        this.initializeTables();
      }
    });
  }

  async initializeTables() {
    const createTables = `
      -- Create colleges table
      CREATE TABLE IF NOT EXISTS colleges (
        college_id INTEGER PRIMARY KEY AUTOINCREMENT,
        college_name TEXT NOT NULL,
        state TEXT NOT NULL,
        district TEXT NOT NULL,
        full_address TEXT,
        contact TEXT,
        website TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create courses table
      CREATE TABLE IF NOT EXISTS courses (
        course_id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create college_courses junction table
      CREATE TABLE IF NOT EXISTS college_courses (
        college_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (college_id, course_id),
        FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_state ON colleges(state);
      CREATE INDEX IF NOT EXISTS idx_district ON colleges(district);
      CREATE INDEX IF NOT EXISTS idx_state_district ON colleges(state, district);
      CREATE INDEX IF NOT EXISTS idx_college_name ON colleges(college_name);
      CREATE INDEX IF NOT EXISTS idx_course_name ON courses(course_name);
      CREATE INDEX IF NOT EXISTS idx_college_id ON college_courses(college_id);
      CREATE INDEX IF NOT EXISTS idx_course_id ON college_courses(course_id);
    `;

    this.db.exec(createTables, (err) => {
      if (err) {
        console.error('Error creating tables:', err.message);
      } else {
        console.log('Database tables initialized');
        this.seedData();
      }
    });
  }

  async seedData() {
    // Check if data already exists
    this.db.get('SELECT COUNT(*) as count FROM colleges', (err, row) => {
      if (err) {
        console.error('Error checking data:', err.message);
        return;
      }

      if (row.count > 0) {
        console.log('Database already has data, skipping seed');
        return;
      }

      console.log('Seeding database with initial data...');
      this.insertSeedData();
    });
  }

  insertSeedData() {
    // Insert courses
    const courses = [
      'Computer Engineering',
      'Information Technology',
      'Artificial Intelligence & Machine Learning (AI/ML)',
      'Artificial Intelligence & Data Science (AI/DS)',
      'Cybersecurity',
      'Management',
      'Electronics',
      'Mechanical'
    ];

    const insertCourse = this.db.prepare('INSERT OR IGNORE INTO courses (course_name) VALUES (?)');
    courses.forEach(course => {
      insertCourse.run(course);
    });
    insertCourse.finalize();

    // Insert colleges
    const colleges = [
      // Maharashtra
      ['Indian Institute of Technology Bombay', 'Maharashtra', 'Mumbai'],
      ['Veermata Jijabai Technological Institute', 'Maharashtra', 'Mumbai'],
      ['Sardar Patel Institute of Technology', 'Maharashtra', 'Mumbai'],
      ['K.J. Somaiya College of Engineering', 'Maharashtra', 'Mumbai'],
      ['Thadomal Shahani Engineering College', 'Maharashtra', 'Mumbai'],
      ['College of Engineering Pune', 'Maharashtra', 'Pune'],
      ['Pune Institute of Computer Technology', 'Maharashtra', 'Pune'],
      ['Maharashtra Institute of Technology', 'Maharashtra', 'Pune'],
      ['Vishwakarma Institute of Technology', 'Maharashtra', 'Pune'],
      ['Sinhgad College of Engineering', 'Maharashtra', 'Pune'],
      ['K.K. Wagh Institute of Engineering Education', 'Maharashtra', 'Nashik'],
      ['Sandip Institute of Technology and Research Centre', 'Maharashtra', 'Nashik'],
      ['Government College of Engineering Aurangabad', 'Maharashtra', 'Aurangabad'],
      ['Marathwada Institute of Technology', 'Maharashtra', 'Aurangabad'],
      ['Visvesvaraya National Institute of Technology', 'Maharashtra', 'Nagpur'],
      ['Government Polytechnic Nagpur', 'Maharashtra', 'Nagpur'],

      // Karnataka
      ['Indian Institute of Science', 'Karnataka', 'Bangalore'],
      ['Indian Institute of Technology Bangalore', 'Karnataka', 'Bangalore'],
      ['National Institute of Technology Karnataka', 'Karnataka', 'Mangalore'],
      ['Bangalore Institute of Technology', 'Karnataka', 'Bangalore'],
      ['R.V. College of Engineering', 'Karnataka', 'Bangalore'],
      ['PES University', 'Karnataka', 'Bangalore'],
      ['M.S. Ramaiah Institute of Technology', 'Karnataka', 'Bangalore'],
      ['BMS College of Engineering', 'Karnataka', 'Bangalore'],
      ['JSS Science and Technology University', 'Karnataka', 'Mysore'],
      ['National Institute of Engineering', 'Karnataka', 'Mysore'],

      // Tamil Nadu
      ['Indian Institute of Technology Madras', 'Tamil Nadu', 'Chennai'],
      ['Anna University', 'Tamil Nadu', 'Chennai'],
      ['College of Engineering Guindy', 'Tamil Nadu', 'Chennai'],
      ['Madras Institute of Technology', 'Tamil Nadu', 'Chennai'],
      ['SSN College of Engineering', 'Tamil Nadu', 'Chennai'],
      ['PSG College of Technology', 'Tamil Nadu', 'Coimbatore'],
      ['Coimbatore Institute of Technology', 'Tamil Nadu', 'Coimbatore'],
      ['Kumaraguru College of Technology', 'Tamil Nadu', 'Coimbatore'],
      ['Thiagarajar College of Engineering', 'Tamil Nadu', 'Madurai'],
      ['Sethu Institute of Technology', 'Tamil Nadu', 'Madurai'],

      // Kerala
      ['Indian Institute of Technology Palakkad', 'Kerala', 'Palakkad'],
      ['National Institute of Technology Calicut', 'Kerala', 'Kozhikode'],
      ['College of Engineering Trivandrum', 'Kerala', 'Thiruvananthapuram'],
      ['Cochin University of Science and Technology', 'Kerala', 'Kochi'],
      ['Government Engineering College Thrissur', 'Kerala', 'Thrissur'],
      ['Rajagiri School of Engineering & Technology', 'Kerala', 'Kochi'],
      ['Mar Athanasius College of Engineering', 'Kerala', 'Kochi'],

      // Andhra Pradesh & Telangana
      ['Indian Institute of Technology Hyderabad', 'Telangana', 'Hyderabad'],
      ['International Institute of Information Technology Hyderabad', 'Telangana', 'Hyderabad'],
      ['Osmania University College of Engineering', 'Telangana', 'Hyderabad'],
      ['Chaitanya Bharathi Institute of Technology', 'Telangana', 'Hyderabad'],
      ['Vasavi College of Engineering', 'Telangana', 'Hyderabad'],
      ['Indian Institute of Technology Tirupati', 'Andhra Pradesh', 'Tirupati'],
      ['Andhra University College of Engineering', 'Andhra Pradesh', 'Visakhapatnam'],
      ['GITAM University', 'Andhra Pradesh', 'Visakhapatnam'],

      // Gujarat
      ['Indian Institute of Technology Gandhinagar', 'Gujarat', 'Gandhinagar'],
      ['Nirma University', 'Gujarat', 'Ahmedabad'],
      ['Gujarat Technological University', 'Gujarat', 'Ahmedabad'],
      ['L.D. College of Engineering', 'Gujarat', 'Ahmedabad'],
      ['Sardar Vallabhbhai National Institute of Technology', 'Gujarat', 'Surat'],
      ['Government Engineering College Surat', 'Gujarat', 'Surat'],

      // Delhi
      ['Indian Institute of Technology Delhi', 'Delhi', 'New Delhi'],
      ['Delhi Technological University', 'Delhi', 'New Delhi'],
      ['Netaji Subhas University of Technology', 'Delhi', 'New Delhi'],
      ['Indira Gandhi Delhi Technical University for Women', 'Delhi', 'New Delhi'],

      // West Bengal
      ['Indian Institute of Technology Kharagpur', 'West Bengal', 'Kharagpur'],
      ['Jadavpur University', 'West Bengal', 'Kolkata'],
      ['Indian Institute of Engineering Science and Technology', 'West Bengal', 'Kolkata'],
      ['Heritage Institute of Technology', 'West Bengal', 'Kolkata']
    ];

    const insertCollege = this.db.prepare('INSERT INTO colleges (college_name, state, district) VALUES (?, ?, ?)');
    colleges.forEach(college => {
      insertCollege.run(college);
    });
    insertCollege.finalize();

    // Insert college-course mappings
    setTimeout(() => {
      this.insertCollegeCourses();
    }, 1000);
  }

  insertCollegeCourses() {
    // Get all colleges and courses
    this.db.all('SELECT * FROM colleges', (err, colleges) => {
      if (err) {
        console.error('Error fetching colleges:', err.message);
        return;
      }

      this.db.all('SELECT * FROM courses', (err, courses) => {
        if (err) {
          console.error('Error fetching courses:', err.message);
          return;
        }

        const insertMapping = this.db.prepare('INSERT OR IGNORE INTO college_courses (college_id, course_id) VALUES (?, ?)');
        
        colleges.forEach(college => {
          const isIIT = college.college_name.includes('IIT') || college.college_name.includes('Indian Institute of Technology');
          const isNIT = college.college_name.includes('NIT') || college.college_name.includes('National Institute');
          const isGovernment = college.college_name.includes('Government') || college.college_name.includes('Anna University');
          const isPremium = isIIT || isNIT;

          courses.forEach(course => {
            let shouldInclude = false;

            // All colleges offer Computer Engineering and Information Technology
            if (course.course_name === 'Computer Engineering' || course.course_name === 'Information Technology') {
              shouldInclude = true;
            }
            // Premium institutes offer all courses
            else if (isPremium) {
              shouldInclude = true;
            }
            // Government colleges offer most courses except Management
            else if (isGovernment && course.course_name !== 'Management') {
              shouldInclude = true;
            }
            // Private colleges offer selective courses
            else if (!isGovernment && !isPremium) {
              const privateCourses = ['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical', 'Management'];
              shouldInclude = privateCourses.includes(course.course_name);
            }
            // AI/ML and AI/DS for tech-focused institutes
            else if ((course.course_name.includes('AI') || course.course_name.includes('Artificial Intelligence')) &&
                     (isPremium || college.college_name.includes('Technology') || college.college_name.includes('Computer'))) {
              shouldInclude = true;
            }
            // Cybersecurity for select institutes
            else if (course.course_name === 'Cybersecurity' &&
                     (isPremium || college.college_name.includes('Technology'))) {
              shouldInclude = true;
            }

            if (shouldInclude) {
              insertMapping.run(college.college_id, course.course_id);
            }
          });
        });

        insertMapping.finalize();
        console.log('Database seeding completed successfully');
      });
    });
  }

  // MySQL-compatible query methods
  async execute(query, params = []) {
    return new Promise((resolve, reject) => {
      if (query.trim().toUpperCase().startsWith('SELECT')) {
        this.db.all(query, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve([rows]);
          }
        });
      } else {
        this.db.run(query, params, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve([{ affectedRows: this.changes, insertId: this.lastID }]);
          }
        });
      }
    });
  }
}

const database = new Database();
module.exports = database;