-- India College Finder Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS india_college_finder;
USE india_college_finder;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS college_courses;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS colleges;

-- Colleges table
CREATE TABLE colleges (
    college_id INT PRIMARY KEY AUTO_INCREMENT,
    college_name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_state (state),
    INDEX idx_district (district),
    INDEX idx_state_district (state, district),
    INDEX idx_college_name (college_name)
);

-- Courses table
CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    course_name VARCHAR(200) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_course_name (course_name)
);

-- Junction table for many-to-many relationship
CREATE TABLE college_courses (
    college_id INT NOT NULL,
    course_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (college_id, course_id),
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    
    INDEX idx_college_id (college_id),
    INDEX idx_course_id (course_id)
);

-- Insert courses
INSERT INTO courses (course_name) VALUES
('Computer Engineering'),
('Information Technology'),
('Artificial Intelligence & Machine Learning (AI/ML)'),
('Artificial Intelligence & Data Science (AI/DS)'),
('Cybersecurity'),
('Management'),
('Electronics'),
('Mechanical');

-- Insert sample colleges data
INSERT INTO colleges (college_name, state, district) VALUES
-- Maharashtra
('Indian Institute of Technology Bombay', 'Maharashtra', 'Mumbai'),
('Veermata Jijabai Technological Institute', 'Maharashtra', 'Mumbai'),
('Sardar Patel Institute of Technology', 'Maharashtra', 'Mumbai'),
('K.J. Somaiya College of Engineering', 'Maharashtra', 'Mumbai'),
('Thadomal Shahani Engineering College', 'Maharashtra', 'Mumbai'),
('College of Engineering Pune', 'Maharashtra', 'Pune'),
('Pune Institute of Computer Technology', 'Maharashtra', 'Pune'),
('Maharashtra Institute of Technology', 'Maharashtra', 'Pune'),
('Vishwakarma Institute of Technology', 'Maharashtra', 'Pune'),
('Sinhgad College of Engineering', 'Maharashtra', 'Pune'),
('K.K. Wagh Institute of Engineering Education', 'Maharashtra', 'Nashik'),
('Sandip Institute of Technology and Research Centre', 'Maharashtra', 'Nashik'),
('Government College of Engineering Aurangabad', 'Maharashtra', 'Aurangabad'),
('Marathwada Institute of Technology', 'Maharashtra', 'Aurangabad'),
('Visvesvaraya National Institute of Technology', 'Maharashtra', 'Nagpur'),
('Government Polytechnic Nagpur', 'Maharashtra', 'Nagpur'),

-- Karnataka
('Indian Institute of Science', 'Karnataka', 'Bangalore'),
('Indian Institute of Technology Bangalore', 'Karnataka', 'Bangalore'),
('National Institute of Technology Karnataka', 'Karnataka', 'Mangalore'),
('Bangalore Institute of Technology', 'Karnataka', 'Bangalore'),
('R.V. College of Engineering', 'Karnataka', 'Bangalore'),
('PES University', 'Karnataka', 'Bangalore'),
('M.S. Ramaiah Institute of Technology', 'Karnataka', 'Bangalore'),
('BMS College of Engineering', 'Karnataka', 'Bangalore'),
('JSS Science and Technology University', 'Karnataka', 'Mysore'),
('National Institute of Engineering', 'Karnataka', 'Mysore'),

-- Tamil Nadu
('Indian Institute of Technology Madras', 'Tamil Nadu', 'Chennai'),
('Anna University', 'Tamil Nadu', 'Chennai'),
('College of Engineering Guindy', 'Tamil Nadu', 'Chennai'),
('Madras Institute of Technology', 'Tamil Nadu', 'Chennai'),
('SSN College of Engineering', 'Tamil Nadu', 'Chennai'),
('PSG College of Technology', 'Tamil Nadu', 'Coimbatore'),
('Coimbatore Institute of Technology', 'Tamil Nadu', 'Coimbatore'),
('Kumaraguru College of Technology', 'Tamil Nadu', 'Coimbatore'),
('Thiagarajar College of Engineering', 'Tamil Nadu', 'Madurai'),
('Sethu Institute of Technology', 'Tamil Nadu', 'Madurai'),

-- Kerala
('Indian Institute of Technology Palakkad', 'Kerala', 'Palakkad'),
('National Institute of Technology Calicut', 'Kerala', 'Kozhikode'),
('College of Engineering Trivandrum', 'Kerala', 'Thiruvananthapuram'),
('Cochin University of Science and Technology', 'Kerala', 'Kochi'),
('Government Engineering College Thrissur', 'Kerala', 'Thrissur'),
('Rajagiri School of Engineering & Technology', 'Kerala', 'Kochi'),
('Mar Athanasius College of Engineering', 'Kerala', 'Kochi'),

-- Andhra Pradesh & Telangana
('Indian Institute of Technology Hyderabad', 'Telangana', 'Hyderabad'),
('International Institute of Information Technology Hyderabad', 'Telangana', 'Hyderabad'),
('Osmania University College of Engineering', 'Telangana', 'Hyderabad'),
('Chaitanya Bharathi Institute of Technology', 'Telangana', 'Hyderabad'),
('Vasavi College of Engineering', 'Telangana', 'Hyderabad'),
('Indian Institute of Technology Tirupati', 'Andhra Pradesh', 'Tirupati'),
('Andhra University College of Engineering', 'Andhra Pradesh', 'Visakhapatnam'),
('GITAM University', 'Andhra Pradesh', 'Visakhapatnam'),

-- Gujarat
('Indian Institute of Technology Gandhinagar', 'Gujarat', 'Gandhinagar'),
('Nirma University', 'Gujarat', 'Ahmedabad'),
('Gujarat Technological University', 'Gujarat', 'Ahmedabad'),
('L.D. College of Engineering', 'Gujarat', 'Ahmedabad'),
('Sardar Vallabhbhai National Institute of Technology', 'Gujarat', 'Surat'),
('Government Engineering College Surat', 'Gujarat', 'Surat'),

-- Rajasthan
('Indian Institute of Technology Jodhpur', 'Rajasthan', 'Jodhpur'),
('Malaviya National Institute of Technology Jaipur', 'Rajasthan', 'Jaipur'),
('Rajasthan Technical University', 'Rajasthan', 'Jaipur'),
('Government Engineering College Ajmer', 'Rajasthan', 'Ajmer'),

-- Uttar Pradesh
('Indian Institute of Technology Kanpur', 'Uttar Pradesh', 'Kanpur'),
('Indian Institute of Technology BHU Varanasi', 'Uttar Pradesh', 'Varanasi'),
('Motilal Nehru National Institute of Technology Allahabad', 'Uttar Pradesh', 'Allahabad'),
('Harcourt Butler Technical University', 'Uttar Pradesh', 'Kanpur'),
('Aligarh Muslim University', 'Uttar Pradesh', 'Aligarh'),

-- West Bengal
('Indian Institute of Technology Kharagpur', 'West Bengal', 'Kharagpur'),
('Jadavpur University', 'West Bengal', 'Kolkata'),
('Indian Institute of Engineering Science and Technology', 'West Bengal', 'Kolkata'),
('Heritage Institute of Technology', 'West Bengal', 'Kolkata'),

-- Delhi
('Indian Institute of Technology Delhi', 'Delhi', 'New Delhi'),
('Delhi Technological University', 'Delhi', 'New Delhi'),
('Netaji Subhas University of Technology', 'Delhi', 'New Delhi'),
('Indira Gandhi Delhi Technical University for Women', 'Delhi', 'New Delhi'),

-- Punjab
('Indian Institute of Technology Ropar', 'Punjab', 'Ropar'),
('Thapar Institute of Engineering and Technology', 'Punjab', 'Patiala'),
('Punjab Engineering College', 'Punjab', 'Chandigarh'),

-- Haryana
('National Institute of Technology Kurukshetra', 'Haryana', 'Kurukshetra'),
('Guru Jambheshwar University of Science and Technology', 'Haryana', 'Hisar'),

-- Odisha
('Indian Institute of Technology Bhubaneswar', 'Odisha', 'Bhubaneswar'),
('National Institute of Technology Rourkela', 'Odisha', 'Rourkela'),
('College of Engineering and Technology Bhubaneswar', 'Odisha', 'Bhubaneswar'),

-- Jharkhand
('Indian Institute of Technology Dhanbad', 'Jharkhand', 'Dhanbad'),
('National Institute of Technology Jamshedpur', 'Jharkhand', 'Jamshedpur'),
('Birla Institute of Technology', 'Jharkhand', 'Ranchi'),

-- Assam
('Indian Institute of Technology Guwahati', 'Assam', 'Guwahati'),
('National Institute of Technology Silchar', 'Assam', 'Silchar'),
('Assam Engineering College', 'Assam', 'Guwahati');

-- Create a temporary table to help with course assignments
CREATE TEMPORARY TABLE temp_course_assignments AS
SELECT 
    c.college_id,
    c.college_name,
    c.state,
    CASE 
        WHEN c.college_name LIKE '%IIT%' OR c.college_name LIKE '%Indian Institute of Technology%' THEN 'premium'
        WHEN c.college_name LIKE '%NIT%' OR c.college_name LIKE '%National Institute%' THEN 'premium'
        WHEN c.college_name LIKE '%Government%' OR c.college_name LIKE '%Anna University%' THEN 'government'
        ELSE 'private'
    END as college_type
FROM colleges c;

-- Assign courses to colleges based on realistic patterns
INSERT INTO college_courses (college_id, course_id)
SELECT DISTINCT
    t.college_id,
    co.course_id
FROM temp_course_assignments t
CROSS JOIN courses co
WHERE 
    -- All colleges offer Computer Engineering and Information Technology
    (co.course_name IN ('Computer Engineering', 'Information Technology'))
    OR
    -- Premium institutes (IITs, NITs) offer all courses
    (t.college_type = 'premium')
    OR
    -- Government colleges offer most courses except Management
    (t.college_type = 'government' AND co.course_name != 'Management')
    OR
    -- Private colleges offer selective courses
    (t.college_type = 'private' AND co.course_name IN (
        'Computer Engineering', 
        'Information Technology', 
        'Electronics', 
        'Mechanical',
        'Management'
    ))
    OR
    -- AI/ML and AI/DS are offered by tech-focused institutes
    (co.course_name IN ('Artificial Intelligence & Machine Learning (AI/ML)', 'Artificial Intelligence & Data Science (AI/DS)')
     AND (t.college_type = 'premium' OR t.college_name LIKE '%Technology%' OR t.college_name LIKE '%Computer%'))
    OR
    -- Cybersecurity is offered by select institutes
    (co.course_name = 'Cybersecurity' 
     AND (t.college_type = 'premium' OR t.college_name LIKE '%Technology%'));

-- Clean up
DROP TEMPORARY TABLE temp_course_assignments;

-- Create indexes for better performance
CREATE INDEX idx_colleges_search ON colleges(state, district, college_name);
CREATE INDEX idx_college_courses_search ON college_courses(college_id, course_id);

-- Verify data
SELECT 
    'Total Colleges' as metric, 
    COUNT(*) as count 
FROM colleges
UNION ALL
SELECT 
    'Total Courses' as metric, 
    COUNT(*) as count 
FROM courses
UNION ALL
SELECT 
    'Total College-Course Mappings' as metric, 
    COUNT(*) as count 
FROM college_courses;

-- Sample queries to test the schema
-- SELECT c.college_name, c.state, c.district, co.course_name
-- FROM colleges c
-- JOIN college_courses cc ON c.college_id = cc.college_id
-- JOIN courses co ON cc.course_id = co.course_id
-- WHERE c.state = 'Maharashtra' AND co.course_name LIKE '%AI%'
-- ORDER BY c.college_name;

COMMIT;