const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'india_college_finder.db');
const dataDir = path.join(__dirname, '..', 'data');
const db = new sqlite3.Database(dbPath);

// Parse CSV with multiline handling
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

console.log('Finding colleges without courses...\n');

db.all(`
  SELECT c.college_name, c.state
  FROM colleges c
  WHERE NOT EXISTS (
    SELECT 1 FROM college_courses cc WHERE cc.college_id = c.college_id
  )
  LIMIT 20
`, (err, colleges) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  console.log(`Found ${colleges.length} colleges without courses (showing first 20):\n`);
  
  colleges.forEach(college => {
    console.log(`College: ${college.college_name}`);
    console.log(`State: ${college.state}`);
    
    // Find this college in CSV files
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
    
    for (const file of files) {
      const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
      const lines = parseCSV(content);
      
      if (lines.length < 2) continue;
      
      const headers = parseCSVLine(lines[0]);
      
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index] || '';
        });
        
        if (row['College Name'] && row['College Name'].includes(college.college_name.substring(0, 30))) {
          console.log(`Course(s) Offered: "${row['Course(s) Offered']}"`);
          console.log('─'.repeat(80));
          break;
        }
      }
    }
  });
  
  db.close();
});
