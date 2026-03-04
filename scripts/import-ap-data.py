import csv
import mysql.connector
import sys

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Google@105',
    'database': 'india_college_finder'
}

# CSV file
CSV_FILE = r'D:\Durvesh Internship\Documentation\Excels\07AP.csv'

def clean_text(text):
    """Clean and normalize text"""
    if not text or text == '-':
        return None
    return text.strip()

def extract_courses(course_text):
    """Extract individual courses from the course text"""
    if not course_text or course_text == '-':
        return []
    
    course_text_lower = course_text.lower()
    
    # If it's just "B.Tech" or generic, add common engineering courses
    if course_text_lower.strip() in ['b.tech', 'btech', 'b tech']:
        return [
            'Computer Engineering',
            'Information Technology',
            'Electronics',
            'Mechanical'
        ]
    
    # If it's MBA, add Management
    if 'mba' in course_text_lower or 'management' in course_text_lower:
        return ['Management']
    
    # Common course patterns
    course_mapping = {
        'Computer Science': 'Computer Engineering',
        'Computer Engineering': 'Computer Engineering',
        'Computer': 'Computer Engineering',
        'CS': 'Computer Engineering',
        'CSE': 'Computer Engineering',
        'Information Technology': 'Information Technology',
        'IT': 'Information Technology',
        'AI': 'Artificial Intelligence & Machine Learning (AI/ML)',
        'Artificial Intelligence': 'Artificial Intelligence & Machine Learning (AI/ML)',
        'Machine Learning': 'Artificial Intelligence & Machine Learning (AI/ML)',
        'AI/ML': 'Artificial Intelligence & Machine Learning (AI/ML)',
        'AIML': 'Artificial Intelligence & Machine Learning (AI/ML)',
        'Data Science': 'Artificial Intelligence & Data Science (AI/DS)',
        'AI/DS': 'Artificial Intelligence & Data Science (AI/DS)',
        'AIDS': 'Artificial Intelligence & Data Science (AI/DS)',
        'Cyber Security': 'Cybersecurity',
        'Cybersecurity': 'Cybersecurity',
        'Management': 'Management',
        'MBA': 'Management',
        'Electronics': 'Electronics',
        'ECE': 'Electronics',
        'Electronics & Communication': 'Electronics',
        'Electronics & Telecommunication': 'Electronics',
        'Mechanical': 'Mechanical',
        'Mech': 'Mechanical',
        'Mechanical Engineering': 'Mechanical'
    }
    
    courses = set()
    
    for pattern, standard_name in course_mapping.items():
        if pattern.lower() in course_text_lower:
            courses.add(standard_name)
    
    # If no courses found but has B.Tech, add common courses
    if not courses and 'b.tech' in course_text_lower:
        return [
            'Computer Engineering',
            'Information Technology',
            'Electronics',
            'Mechanical'
        ]
    
    return list(courses)

def main():
    print("=" * 70)
    print("Andhra Pradesh College Data Import")
    print("=" * 70)
    
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("\n+ Connected to MySQL database")
        
        # Process CSV file
        print(f"\nProcessing: {CSV_FILE}")
        
        count = 0
        with open(CSV_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                college_name = clean_text(row.get('College Name'))
                district = clean_text(row.get('District'))
                course_text = clean_text(row.get('Course(s) Offered'))
                full_address = clean_text(row.get('Full Address'))
                contact = clean_text(row.get('Contact'))
                website = clean_text(row.get('Website'))
                
                if not college_name or not district:
                    continue
                
                # Insert college
                try:
                    cursor.execute("""
                        INSERT INTO colleges (college_name, state, district, full_address, contact, website)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (college_name, 'Andhra Pradesh', district, full_address, contact, website))
                    
                    college_id = cursor.lastrowid
                    
                    # Extract and insert courses
                    courses = extract_courses(course_text)
                    
                    for course_name in courses:
                        # Get or create course
                        cursor.execute("""
                            SELECT course_id FROM courses WHERE course_name = %s
                        """, (course_name,))
                        
                        result = cursor.fetchone()
                        if result:
                            course_id = result[0]
                        else:
                            cursor.execute("""
                                INSERT INTO courses (course_name) VALUES (%s)
                            """, (course_name,))
                            course_id = cursor.lastrowid
                        
                        # Link college to course
                        try:
                            cursor.execute("""
                                INSERT INTO college_courses (college_id, course_id)
                                VALUES (%s, %s)
                            """, (college_id, course_id))
                        except mysql.connector.IntegrityError:
                            pass
                    
                    count += 1
                    print(f"  + Added: {college_name} ({district})")
                    
                except mysql.connector.IntegrityError as e:
                    print(f"  ! Skipped duplicate: {college_name}")
                    continue
        
        conn.commit()
        
        # Show statistics
        print("\n" + "=" * 70)
        print("Import Complete")
        print("=" * 70)
        print(f"Total Andhra Pradesh Colleges Imported: {count}")
        
        cursor.execute("SELECT COUNT(*) FROM colleges WHERE state = 'Andhra Pradesh'")
        total = cursor.fetchone()[0]
        print(f"Total Andhra Pradesh Colleges in Database: {total}")
        
        print("\n" + "=" * 70)
        print("+ Data imported successfully!")
        print("=" * 70)
        
    except mysql.connector.Error as e:
        print(f"\nx Database error: {e}")
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
            print("\n+ Database connection closed")

if __name__ == "__main__":
    main()
