# India College Finder

A full-stack web application for discovering colleges across India with comprehensive information including courses, addresses, contact details, and websites.

## Features

- **Advanced Search**: Filter 2,288 colleges by state, district, and course offerings
- **Comprehensive Information**: View college name, courses, full address, contact, and website
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Real-time Results**: Dynamic search results without page reloads
- **Modern UI**: Clean, professional interface with gradient design
- **SQLite Database**: Lightweight, zero-configuration database

## Technology Stack

- **Frontend**: React.js, Modern JavaScript (ES6+), Responsive CSS
- **Backend**: Node.js, Express.js, RESTful APIs
- **Database**: SQLite 3 with optimized indexing
- **Security**: Input validation, SQL injection protection, rate limiting

## Quick Start

### Prerequisites
- Node.js (v18.0.0+)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd india-college-finder
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ..
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   The default configuration uses SQLite (no additional setup needed).

4. **Import Data**
   ```bash
   node scripts/import-all-data.js
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   npm start
   
   # Terminal 2: Frontend
   cd client
   npm start
   ```

6. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
india-college-finder/
├── server.js                 # Main server file
├── package.json             # Backend dependencies
├── .env                     # Environment configuration
├── india_college_finder.db  # SQLite database
├── config/
│   ├── database.js          # Database configuration
│   └── database-sqlite.js   # SQLite implementation
├── src/
│   ├── controllers/         # Request handlers
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── models/             # Database models
│   └── middleware/         # Custom middleware
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app component
│   └── package.json        # Frontend dependencies
├── data/                   # CSV data files
│   ├── 01MH.csv           # Maharashtra colleges
│   ├── 02UP.csv           # Uttar Pradesh colleges
│   └── ...                # Other state files
├── scripts/                # Data import scripts
│   └── import-all-data.js  # Import all CSV files
└── docs/                   # Documentation
    └── *.md               # Various documentation files
```

## Database Information

### Current Statistics
- **Total Colleges**: 2,288
- **Total States/UTs**: 35
- **Total Courses**: 11
- **College-Course Mappings**: 4,435

### Available Courses
1. Computer Engineering
2. Information Technology
3. Artificial Intelligence & Machine Learning (AI/ML)
4. Artificial Intelligence & Data Science (AI/DS)
5. Cybersecurity
6. Management
7. Electronics
8. Mechanical
9. Civil Engineering
10. Electrical Engineering
11. Chemical Engineering

## API Endpoints

### Search API
- `GET /api/search` - Search colleges with filters
  - Query Parameters: `state`, `district`, `course`
- `GET /api/search/states` - Get all states
- `GET /api/search/districts` - Get districts by state
- `GET /api/search/courses` - Get all courses

### Health Check
- `GET /health` - Server health status

### Example API Calls
```bash
# Search all colleges in Maharashtra
curl "http://localhost:5000/api/search?state=Maharashtra"

# Search IT colleges in Pune
curl "http://localhost:5000/api/search?state=Maharashtra&district=Pune&course=Information%20Technology"

# Get all states
curl "http://localhost:5000/api/search/states"
```

## Data Import

### Adding New Data

1. **Add CSV files to the `data/` folder**
   - Files should have columns: College Name, State, District, Course(s) Offered, Full Address, Contact, Website

2. **Run the import script**
   ```bash
   node scripts/import-all-data.js
   ```

3. **Restart the server**
   ```bash
   npm start
   ```

### CSV Format
```csv
#,College Name,Course(s) Offered,District,Full Address,Contact,Website,State
1,Example College,"B.Tech (Computer, IT, Electronics)",Mumbai,"123 Street, Mumbai",022-12345678,https://example.edu,Maharashtra
```

## Environment Variables

Create a `.env` file with:
```
NODE_ENV=development
PORT=5000
USE_SQLITE=true
CORS_ORIGIN=http://localhost:3000
```

For MySQL instead of SQLite:
```
NODE_ENV=production
PORT=5000
USE_SQLITE=false
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=india_college_finder
DB_PORT=3306
CORS_ORIGIN=http://localhost:3000
```

## Security Features

- SQL injection protection through parameterized queries
- Input validation and sanitization using express-validator
- Rate limiting (100 requests per 15 minutes)
- CORS configuration for cross-origin requests
- Security headers via Helmet.js
- Environment-based configuration

## User Interface

### Search Features
- State filter (All or specific state)
- District filter (dynamically updated based on state)
- Course filter (all available courses)
- Real-time search results

### Results Display
- Responsive table layout
- Columns: College Name, State, District, Courses, Address, Contact, Website
- Clickable website links (open in new tab)
- Mobile-optimized with horizontal scroll
- Loading states and error handling

### Design
- Modern gradient color scheme (purple/blue)
- Clean, professional layout
- Hover effects on interactive elements
- Responsive breakpoints for all screen sizes

## Browser Compatibility

Tested and working on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Common Issues

**Port Already in Use**
- Change PORT in `.env` file
- Kill existing processes: `npx kill-port 5000 3000`

**Database Not Found**
- Run the import script: `node scripts/import-all-data.js`

**CORS Issues**
- Update CORS_ORIGIN in `.env`
- Ensure frontend and backend URLs match

**Build Errors**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the LAUNCH-GUIDE.md
3. Open an issue with detailed information

---

**India College Finder** - Discover educational institutions across India.
