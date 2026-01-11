# E-Attend Backend Server

Backend API server for the E-Attend application with MongoDB authentication.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create a `.env` file in the `server` directory with the following:
```env
MONGODB_URI=mongodb+srv://eattend:eAttend%40krmu@cluster0.mongodb.net/e-attend?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-change-in-production-2024
PORT=3000
FRONTEND_URL=http://localhost:8080
```

**Important:** 
- Replace `cluster0.mongodb.net` with your actual MongoDB Atlas cluster URL
- The `@` symbol in the password should be URL-encoded as `%40`
- Change the `JWT_SECRET` to a secure random string in production

3. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register/student` - Register a new student
- `POST /api/auth/login/student` - Login as a student
- `GET /api/auth/me` - Get current authenticated user (requires Bearer token)

### Health Check

- `GET /api/health` - Check if the API is running

## MongoDB Connection

The server connects to MongoDB using the connection string in the `.env` file. Make sure:
1. Your MongoDB Atlas cluster is running
2. The database user has read/write permissions
3. Your IP address is whitelisted in MongoDB Atlas (or use 0.0.0.0/0 for development)

