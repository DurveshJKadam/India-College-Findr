import csv
import mysql.connector
import os
import re
from pathlib import Path
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

# CSV directory
CSV_DIR = r'D:\Durvesh Internship\Documentation\Excels'

def clean_text(text):
    """Clean and normalize text"""
    if not text or text == '-':
        return None
    return text.strip()

def extract_courses(course_text):
    """Extract individual courses from the course text"""
    if not course_text or course_text == '-':
        return []
    
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
    course_text_lower = course_text.lower()
    
    for pattern, standard_name in course_mapping.items():
        if pattern.lower() in course_text_lower:
            courses.add(standard_name)
    
    return list(courses)

def import_csv_file(cursor, csv_file, state_name):
    """Import data from a single CSV file"""
    print(f"\nProcessing: {csv_file}")
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
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
                    """, (college_name, state_name, district, full_address, contact, website))
                    
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
                            # Duplicate entry, skip
                            pass
                    
                    print(f"  + Added: {college_name} ({district})")
                    
                except mysql.connector.IntegrityError as e:
                    print(f"  ! Skipped duplicate: {college_name}")
                    continue
                    
    except Exception as e:
        print(f"  x Error processing file: {e}")

def main():
    print("=" * 70)
    print("India College Finder - CSV Data Import")
    print("=" * 70)
    
    # State code to name mapping
    state_mapping = {
        '01MH': 'Maharashtra',
        '02UP': 'Uttar Pradesh',
        '03KA': 'Karnataka',
        '04RJ': 'Rajasthan',
        '05TN': 'Tamil Nadu',
        '06MP': 'Madhya Pradesh',
        '07AP': 'Andhra Pradesh',
        '08GJ': 'Gujarat',
        '09TG': 'Telangana',
        '10WB': 'West Bengal',
        '11KL': 'Kerala',
        '12 PB': 'Punjab',
        '13BR': 'Bihar',
        '14OD': 'Odisha',
        '15HR': 'Haryana',
        '16CG': 'Chhattisgarh',
        '17JH': 'Jharkhand',
        '18AS': 'Assam',
        '19UK': 'Uttarakhand',
        '20HP': 'Himachal Pradesh',
        '21JK': 'Jammu and Kashmir',
        '22DL': 'Delhi',
        '23SK': 'Sikkim',
        '24AR': 'Arunachal Pradesh',
        '25PY': 'Puducherry',
        '26ML': 'Meghalaya',
        '27NL': 'Nagaland',
        '28GA': 'Goa',
        '29MN': 'Manipur',
        '30MZ': 'Mizoram',
        '31TR': 'Tripura',
        '32AN': 'Andaman and Nicobar Islands',
        '33CH': 'Chandigarh',
        '34DD': 'Dadra and Nagar Haveli and Daman and Diu',
        '35LA': 'Ladakh'
    }
    
    # Connect to database
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("\n+ Connected to MySQL database")
        
        # Clear existing data
        print("\nClearing existing data...")
        cursor.execute("DELETE FROM college_courses")
        cursor.execute("DELETE FROM colleges WHERE college_id > 88")  # Keep sample data
        cursor.execute("DELETE FROM courses WHERE course_id > 8")  # Keep sample courses
        conn.commit()
        print("+ Existing data cleared")
        
        # Process each CSV file
        csv_files = sorted(Path(CSV_DIR).glob('*.csv'))
        total_files = len(csv_files)
        
        print(f"\nFound {total_files} CSV files to process")
        print("-" * 70)
        
        for idx, csv_file in enumerate(csv_files, 1):
            file_code = csv_file.stem.replace(' ', '')
            state_name = state_mapping.get(file_code, file_code)
            
            print(f"\n[{idx}/{total_files}] State: {state_name}")
            import_csv_file(cursor, csv_file, state_name)
            conn.commit()
        
        # Show statistics
        print("\n" + "=" * 70)
        print("Import Complete - Statistics")
        print("=" * 70)
        
        cursor.execute("SELECT COUNT(*) FROM colleges")
        total_colleges = cursor.fetchone()[0]
        print(f"Total Colleges: {total_colleges}")
        
        cursor.execute("SELECT COUNT(*) FROM courses")
        total_courses = cursor.fetchone()[0]
        print(f"Total Courses: {total_courses}")
        
        cursor.execute("SELECT COUNT(*) FROM college_courses")
        total_mappings = cursor.fetchone()[0]
        print(f"Total College-Course Mappings: {total_mappings}")
        
        cursor.execute("""
            SELECT state, COUNT(*) as count 
            FROM colleges 
            GROUP BY state 
            ORDER BY count DESC 
            LIMIT 10
        """)
        
        print("\nTop 10 States by College Count:")
        for state, count in cursor.fetchall():
            print(f"  {state}: {count} colleges")
        
        print("\n" + "=" * 70)
        print("+ All data imported successfully!")
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
