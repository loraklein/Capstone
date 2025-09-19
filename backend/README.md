# Document Scanner Backend API

Backend API for the Document Scanner mobile application built with Express.js and PostgreSQL.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure your settings:
```bash
cp env.example .env
```

Edit `.env` with your database credentials and other settings.

### 3. Database Setup
Make sure PostgreSQL is running and create the database:
```sql
CREATE DATABASE docuscan_db;
```

### 4. Development
Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 5. Production Build
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication (Coming Soon)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Projects (Coming Soon)
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get specific project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Pages (Coming Soon)
- `GET /api/projects/:id/pages` - Get project pages
- `POST /api/projects/:id/pages` - Upload new page
- `PUT /api/pages/:id` - Update page
- `DELETE /api/pages/:id` - Delete page

## Project Structure

```
src/
├── config/          # Database and app configuration
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API route definitions
├── services/        # Business logic
├── utils/           # Utility functions
└── index.ts         # Application entry point
```

## Technologies Used

- **Express.js** - Web framework
- **PostgreSQL** - Database
- **TypeScript** - Type safety
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
- **Helmet** - Security headers

