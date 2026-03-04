const db = require('../../config/database');

class College {
  static async search(filters = {}) {
    try {
      let query = `
        SELECT DISTINCT 
          c.college_id,
          c.college_name,
          c.state,
          c.district,
          c.full_address,
          c.contact,
          c.website,
          GROUP_CONCAT(DISTINCT co.course_name ORDER BY co.course_name ASC SEPARATOR ', ') as courses
        FROM colleges c
        LEFT JOIN college_courses cc ON c.college_id = cc.college_id
        LEFT JOIN courses co ON cc.course_id = co.course_id
        WHERE 1=1
      `;
      
      const params = [];
      
      // Apply filters
      if (filters.state && filters.state !== 'All') {
        query += ' AND c.state = ?';
        params.push(filters.state);
      }
      
      if (filters.district && filters.district !== 'All') {
        query += ' AND c.district = ?';
        params.push(filters.district);
      }
      
      if (filters.course && filters.course !== 'All') {
        query += ' AND co.course_name = ?';
        params.push(filters.course);
      }
      
      query += ' GROUP BY c.college_id, c.college_name, c.state, c.district, c.full_address, c.contact, c.website';
      query += ' ORDER BY c.state, c.district, c.college_name';
      
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Database search error:', error);
      throw new Error('Failed to search colleges');
    }
  }

  static async getStates() {
    try {
      const [rows] = await db.execute(
        'SELECT DISTINCT state FROM colleges ORDER BY state'
      );
      return rows.map(row => row.state);
    } catch (error) {
      console.error('Database error getting states:', error);
      throw new Error('Failed to fetch states');
    }
  }

  static async getDistrictsByState(state) {
    try {
      let query = 'SELECT DISTINCT district FROM colleges';
      const params = [];
      
      if (state && state !== 'All') {
        query += ' WHERE state = ?';
        params.push(state);
      }
      
      query += ' ORDER BY district';
      
      const [rows] = await db.execute(query, params);
      return rows.map(row => row.district);
    } catch (error) {
      console.error('Database error getting districts:', error);
      throw new Error('Failed to fetch districts');
    }
  }

  static async getCourses() {
    try {
      const [rows] = await db.execute(
        'SELECT course_name FROM courses ORDER BY course_name'
      );
      return rows.map(row => row.course_name);
    } catch (error) {
      console.error('Database error getting courses:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  static async chatbotSearch(entities) {
    try {
      let query = `
        SELECT DISTINCT 
          c.college_name,
          c.state,
          c.district,
          co.course_name
        FROM colleges c
        JOIN college_courses cc ON c.college_id = cc.college_id
        JOIN courses co ON cc.course_id = co.course_id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (entities.state) {
        query += ' AND LOWER(c.state) LIKE LOWER(?)';
        params.push(`%${entities.state}%`);
      }
      
      if (entities.district) {
        query += ' AND LOWER(c.district) LIKE LOWER(?)';
        params.push(`%${entities.district}%`);
      }
      
      if (entities.course) {
        query += ' AND LOWER(co.course_name) LIKE LOWER(?)';
        params.push(`%${entities.course}%`);
      }
      
      query += ' ORDER BY c.state, c.district, c.college_name LIMIT 50';
      
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Database chatbot search error:', error);
      throw new Error('Failed to process chatbot query');
    }
  }
}

module.exports = College;