# E-Attend Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB instance)

## Quick Start

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
cd ..
```

### 2. Environment Setup

**Frontend (.env in root):**
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3000/api
```

**Backend (server/.env):**
Create a `.env` file in the `server/` directory:
```env
# MongoDB Connection
# Replace CLUSTER_URL with your actual MongoDB Atlas cluster URL
MONGODB_URI=mongodb+srv://eattend:eAttend%40krmu@CLUSTER_URL/e-attend?retryWrites=true&w=majority

# JWT Secret (Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024

# Server Port
PORT=3000

# Frontend URL for CORS
FRONTEND_URL=http://localhost:8080

# Microsoft OAuth Configuration
MICROSOFT_CLIENT_ID=your-azure-app-client-id
MICROSOFT_CLIENT_SECRET=your-azure-app-client-secret
MICROSOFT_TENANT_ID=your-azure-tenant-id
MICROSOFT_REDIRECT_URI=http://localhost:8080/auth/student
```

**Important:** 
- Replace `CLUSTER_URL` with your actual MongoDB Atlas cluster URL
- The `@` symbol in the password is URL-encoded as `%40`
- Example: `mongodb+srv://eattend:eAttend%40krmu@cluster0.xxxxx.mongodb.net/e-attend?retryWrites=true&w=majority`

### 3. MongoDB Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user:
   - Username: `eattend`
   - Password: `eAttend@krmu`
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string and replace `CLUSTER_URL` in the `.env` file

### 3.5. Microsoft Azure Setup (Required for Authentication)

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: E-Attend
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: `http://localhost:8080/auth/student` (for development)
5. After creation, note the **Application (client) ID** and **Directory (tenant) ID**
6. Go to **Certificates & secrets** > **New client secret**
7. Copy the secret value and add it to `MICROSOFT_CLIENT_SECRET` in `.env`
8. Go to **API permissions** > **Add a permission** > **Microsoft Graph** > **Delegated permissions**
9. Add: `openid`, `profile`, `email`, `User.Read`
10. Click **Grant admin consent**
11. Update `server/.env` with your Azure credentials

### 4. Run the Application

**Option 1: Run both frontend and backend together:**
```bash
npm run dev:all
```

**Option 2: Run separately:**

Terminal 1 (Backend):
```bash
npm run dev:server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000/api

## Student Authentication

Students authenticate using Microsoft OAuth:

1. Visit `/auth/student`
2. Click "Sign in with Microsoft"
3. Sign in with your @krmu.edu.in Microsoft account
4. Your account is automatically created/updated with information from Microsoft
5. Access protected student routes:
   - `/student` - Dashboard
   - `/student/events` - Browse Events
   - `/student/events/:eventId` - Event Details
   - `/student/registrations` - My Registrations
   - `/student/attendance` - Attendance Records

## Troubleshooting

### MongoDB Connection Issues
- Verify your MongoDB Atlas cluster is running
- Check that your IP is whitelisted
- Ensure the connection string is correct (password URL-encoded)
- Verify database user credentials

### CORS Issues
- Ensure `FRONTEND_URL` in `server/.env` matches your frontend URL
- Check that the backend is running on port 3000

### Authentication Issues
- Check that JWT_SECRET is set in `server/.env`
- Verify the token is being stored in localStorage
- Check browser console for API errors


