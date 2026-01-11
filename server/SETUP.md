# Backend Setup Guide

## Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```env
# MongoDB Connection
# Note: The @ symbol in password must be URL encoded as %40
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

## MongoDB Connection String

1. Get your MongoDB Atlas cluster URL from your MongoDB Atlas dashboard
2. Replace `CLUSTER_URL` in the `MONGODB_URI` with your actual cluster URL
3. The password `eAttend@krmu` is already URL-encoded as `eAttend%40krmu` in the connection string

Example:
```
mongodb+srv://eattend:eAttend%40krmu@cluster0.xxxxx.mongodb.net/e-attend?retryWrites=true&w=majority
```

## Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the `.env` file with your MongoDB connection string

4. Start the server:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3000`

## Microsoft OAuth Configuration

For detailed setup instructions and troubleshooting, see [MICROSOFT_OAUTH_SETUP.md](../MICROSOFT_OAUTH_SETUP.md)

### Quick Setup

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Configure your app:
   - **Name**: E-Attend
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: `http://localhost:8080/auth/student` (for development)
5. After creation, copy:
   - **Application (client) ID** → `MICROSOFT_CLIENT_ID`
   - **Directory (tenant) ID** → `MICROSOFT_TENANT_ID`
6. Go to **Certificates & secrets** > **New client secret**
7. Copy the secret **VALUE** (not the ID) → `MICROSOFT_CLIENT_SECRET`
   - ⚠️ **Important**: You can only see the secret value once!
8. Go to **API permissions** > **Add a permission** > **Microsoft Graph** > **Delegated permissions**
9. Add: `openid`, `profile`, `email`, `User.Read`
10. Click **Grant admin consent**

### Important Notes

- The client secret **VALUE** must be copied immediately when created
- If secret expires, create a new one and update `MICROSOFT_REDIRECT_URI` in `.env`
- Redirect URI must match exactly (including http/https and port)
- Ensure admin consent is granted for all API permissions

## API Endpoints

- `GET /api/auth/microsoft/url` - Get Microsoft OAuth URL
- `POST /api/auth/microsoft/callback` - Handle OAuth callback
- `GET /api/auth/me` - Get current authenticated user
- `GET /api/health` - Health check endpoint


