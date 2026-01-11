# E-Attend - Event & Attendance Management System

**E-Attend** is a comprehensive event and attendance management platform for K. R. Mangalam University. The system enables students, coordinators, convenors, and administrators to manage events, track attendance, and monitor participation seamlessly.

## 🎯 Features

- **Microsoft OAuth Authentication** - Secure login using Microsoft Outlook accounts (@krmu.edu.in)
- **Event Management** - Create, browse, and register for university events
- **Attendance Tracking** - Real-time attendance marking and tracking
- **Role-Based Access** - Separate portals for Students, Coordinators, Convenors, Club Admins, and Super Admins
- **Dashboard Analytics** - Comprehensive statistics and insights
- **Cross-Tab Synchronization** - Seamless authentication across browser tabs

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool and dev server
- **shadcn/ui** - Modern UI components
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Framer Motion** - Animation library

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** - Token-based authentication
- **Microsoft Graph API** - OAuth integration
- **Nodemailer** - Email service

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB instance)
- Microsoft Azure App Registration (for OAuth)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd krmu-event-hub
```

### 2. Install Dependencies

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

### 3. Environment Setup

**Frontend (.env in root):**
```env
VITE_API_URL=http://localhost:3000/api
```

**Backend (server/.env):**
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://eattend:eAttend%40krmu@CLUSTER_URL/e-attend?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024

# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:8080

# Microsoft OAuth Configuration
MICROSOFT_CLIENT_ID=your-azure-app-client-id
MICROSOFT_CLIENT_SECRET=your-azure-app-client-secret
MICROSOFT_TENANT_ID=your-azure-tenant-id
MICROSOFT_REDIRECT_URI=http://localhost:8080/auth/student
```

### 4. Microsoft Azure Setup

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: E-Attend
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: `http://localhost:8080/auth/student` (for development)
5. After creation, note the **Application (client) ID** and **Directory (tenant) ID**
6. Go to **Certificates & secrets** > **New client secret**
7. Copy the secret value (you'll need it for `MICROSOFT_CLIENT_SECRET`)
8. Go to **API permissions** > **Add a permission** > **Microsoft Graph** > **Delegated permissions**
9. Add: `openid`, `profile`, `email`, `User.Read`
10. Click **Grant admin consent**

### 5. Run the Application

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

### 6. Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

## 🔐 Authentication

### Microsoft OAuth Login

The system uses Microsoft OAuth for authentication. Only users with `@krmu.edu.in` email addresses can sign in.

**Login Flow:**
1. User clicks "Sign in with Microsoft"
2. Redirected to Microsoft login page
3. User authenticates with their KRMU Microsoft account
4. System validates domain (@krmu.edu.in)
5. User profile is fetched from Microsoft Graph API
6. Account is created/updated automatically
7. User is redirected to their dashboard

**User Data Fetched:**
- Display Name
- Email Address
- Department (if available)
- Microsoft User ID

## 📁 Project Structure

```
krmu-event-hub/
├── server/                 # Backend server
│   ├── config/            # Configuration files
│   ├── lib/                # Utility libraries
│   ├── middleware/         # Express middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   └── server.js          # Server entry point
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── context/            # React contexts
│   ├── lib/                # Utility functions
│   ├── pages/              # Page components
│   ├── types/               # TypeScript types
│   └── App.tsx             # Main app component
├── public/                  # Static assets
└── package.json            # Frontend dependencies
```

## 🎨 Available Scripts

- `npm run dev` - Start frontend development server
- `npm run dev:server` - Start backend development server
- `npm run dev:all` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📚 API Endpoints

### Authentication
- `GET /api/auth/microsoft/url` - Get Microsoft OAuth URL
- `POST /api/auth/microsoft/callback` - Handle OAuth callback
- `GET /api/auth/me` - Get current authenticated user

### Health Check
- `GET /api/health` - Server health status

## 🔒 Security Features

- **Domain Validation** - Only @krmu.edu.in emails allowed
- **JWT Tokens** - Secure token-based authentication
- **Password Hashing** - Bcrypt for password storage (for legacy accounts)
- **CORS Protection** - Configured CORS policies
- **Input Validation** - Express-validator for request validation

## 🐛 Troubleshooting

### Microsoft OAuth Issues
- Verify Azure App Registration is configured correctly
- Check redirect URI matches exactly (including http/https)
- Ensure API permissions are granted with admin consent
- Verify tenant ID is correct

### MongoDB Connection Issues
- Check MongoDB Atlas cluster is running
- Verify IP whitelist includes your IP
- Ensure connection string is correct (password URL-encoded)
- Check database user credentials

### CORS Issues
- Ensure `FRONTEND_URL` in `server/.env` matches your frontend URL
- Check backend is running on correct port

## 📝 License

This project is proprietary software for K. R. Mangalam University.

## 👥 Contributing

This is an internal project for K. R. Mangalam University. For contributions, please contact the development team.

## 📞 Support

For issues or questions, please contact the IT department at K. R. Mangalam University.

---

**E-Attend** - Event & Attendance Management System  
**K. R. Mangalam University**
