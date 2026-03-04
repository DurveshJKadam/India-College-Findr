# India College Finder - Setup Instructions

## Prerequisites

- Node.js (v18.0.0 or higher)
- MySQL 8.0+
- npm or yarn package manager

## Database Setup

1. **Install MySQL 8.0+**
   - Download and install MySQL from [official website](https://dev.mysql.com/downloads/)
   - Start MySQL service

2. **Create Database and Import Schema**
   ```bash
   # Login to MySQL
   mysql -u root -p
   
   # Run the schema file
   source docs/database-schema.sql
   
   # Or import directly
   mysql -u root -p < docs/database-schema.sql
   ```

3. **Verify Database Setup**
   ```sql
   USE india_college_finder;
   SHOW TABLES;
   SELECT COUNT(*) FROM colleges;
   SELECT COUNT(*) FROM courses;
   SELECT COUNT(*) FROM college_courses;
   ```

## Backend Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env file with your database credentials
   nano .env
   ```

   Update the following variables in `.env`:
   ```
   NODE_ENV=production
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=india_college_finder
   DB_PORT=3306
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Test Backend**
   ```bash
   # Start development server
   npm run dev
   
   # Or start production server
   npm start
   ```

   Backend will be available at `http://localhost:5000`

## Frontend Setup

1. **Install Client Dependencies**
   ```bash
   npm run install-client
   ```

2. **Start Development Server**
   ```bash
   # In a new terminal
   npm run client
   ```

   Frontend will be available at `http://localhost:3000`

## Production Deployment

### Option 1: Traditional Server Deployment

1. **Prepare Production Environment**
   ```bash
   # Set environment to production
   export NODE_ENV=production
   
   # Build React app
   npm run build
   
   # Start production server
   npm start
   ```

2. **Database Configuration**
   - Use cloud MySQL service (AWS RDS, Google Cloud SQL, etc.)
   - Update `.env` with production database credentials
   - Ensure database is accessible from your server

### Option 2: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   # Copy package files
   COPY package*.json ./
   RUN npm ci --only=production
   
   # Copy client package files
   COPY client/package*.json ./client/
   RUN cd client && npm ci --only=production
   
   # Copy source code
   COPY . .
   
   # Build client
   RUN npm run build
   
   EXPOSE 5000
   
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   # Build Docker image
   docker build -t india-college-finder .
   
   # Run container
   docker run -p 5000:5000 --env-file .env india-college-finder
   ```

### Option 3: Cloud Platform Deployment

#### Heroku
1. **Install Heroku CLI**
2. **Deploy**
   ```bash
   # Login to Heroku
   heroku login
   
   # Create app
   heroku create your-app-name
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set DB_HOST=your-db-host
   heroku config:set DB_USER=your-db-user
   heroku config:set DB_PASSWORD=your-db-password
   heroku config:set DB_NAME=india_college_finder
   
   # Deploy
   git push heroku main
   ```

#### AWS/Google Cloud/Azure
- Use their respective Node.js deployment guides
- Ensure environment variables are properly configured
- Use managed database services for MySQL

## API Endpoints

### Search API
- `GET /api/search` - Search colleges with filters
- `GET /api/search/states` - Get all states
- `GET /api/search/districts?state=StateName` - Get districts by state
- `GET /api/search/courses` - Get all courses

### Chatbot API
- `POST /api/chatbot` - Send message to chatbot

### Health Check
- `GET /health` - Server health status

## Testing the Application

1. **Test Search Functionality**
   - Open `http://localhost:3000`
   - Try different filter combinations
   - Verify results are displayed correctly

2. **Test Chatbot**
   - Ask: "Which colleges offer AI/ML in Mumbai?"
   - Ask: "Show IT colleges in Maharashtra"
   - Ask: "Colleges offering Cybersecurity in India"

3. **Test API Endpoints**
   ```bash
   # Test search
   curl "http://localhost:5000/api/search?state=Maharashtra&course=Computer%20Engineering"
   
   # Test chatbot
   curl -X POST http://localhost:5000/api/chatbot \
     -H "Content-Type: application/json" \
     -d '{"message": "Which colleges offer AI/ML in Mumbai?"}'
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL service is running
   - Verify credentials in `.env` file
   - Ensure database exists and schema is imported

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes: `lsof -ti:5000 | xargs kill -9`

3. **CORS Issues**
   - Update CORS_ORIGIN in `.env`
   - Ensure frontend and backend URLs match

4. **Build Errors**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Performance Optimization

1. **Database Indexes**
   - Indexes are already created in schema
   - Monitor query performance with `EXPLAIN`

2. **API Caching**
   - Implement Redis for caching frequent queries
   - Cache states, districts, and courses data

3. **Frontend Optimization**
   - Enable gzip compression (already configured)
   - Implement lazy loading for large result sets
   - Add pagination for search results

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` file to version control
   - Use strong database passwords
   - Rotate credentials regularly

2. **Input Validation**
   - All inputs are validated using express-validator
   - SQL injection protection through parameterized queries

3. **Rate Limiting**
   - API rate limiting is configured (100 requests per 15 minutes)
   - Adjust limits based on usage patterns

4. **HTTPS**
   - Always use HTTPS in production
   - Configure SSL certificates properly

## Monitoring and Maintenance

1. **Logging**
   - Monitor application logs
   - Set up log rotation
   - Use structured logging for better analysis

2. **Database Maintenance**
   - Regular backups
   - Monitor query performance
   - Update statistics regularly

3. **Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Test updates in staging environment

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs
3. Test API endpoints individually
4. Verify database connectivity and data integrity