import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Student from '../models/Student.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId, userRole = 'student') => {
  return jwt.sign({ userId, role: userRole }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Microsoft OAuth callback - handles the authorization code
router.post('/microsoft/callback', async (req, res) => {
  try {
    const { code, requestedRole } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Validate environment variables
    if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET || !process.env.MICROSOFT_TENANT_ID) {
      console.error('Missing Microsoft OAuth environment variables');
      return res.status(500).json({
        message: 'Server configuration error: Microsoft OAuth credentials are not configured',
        hint: 'Please check server/.env file and ensure MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, and MICROSOFT_TENANT_ID are set',
      });
    }

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
        grant_type: 'authorization_code',
        scope: 'openid profile email User.Read',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, id_token } = tokenResponse.data;

    // Get user info from Microsoft Graph API
    const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const microsoftUser = userResponse.data;
    const email = microsoftUser.mail || microsoftUser.userPrincipalName;

    if (!email) {
      return res.status(400).json({ message: 'Email address not available from Microsoft account' });
    }

    // For development/demo: allow selecting role based on portal user chose.
    const allowedRoles = new Set(['student', 'coordinator', 'convenor', 'club', 'admin']);
    const normalizedRequestedRole =
      typeof requestedRole === 'string' && allowedRoles.has(requestedRole) ? requestedRole : undefined;

    // Extract identifier from email (fallback when roll number is unknown)
    const rollNumber = email.split('@')[0];

    // Find or create student
    let student = await Student.findOne({ email });

    if (!student) {
      // Create new student from Microsoft account
      student = new Student({
        email,
        name: microsoftUser.displayName || microsoftUser.givenName + ' ' + microsoftUser.surname,
        rollNumber,
        department: microsoftUser.department || '',
        role: normalizedRequestedRole || 'student',
        // No password needed for OAuth
        password: crypto.randomBytes(32).toString('hex'), // Random password, won't be used
        microsoftId: microsoftUser.id,
      });

      await student.save();
    } else {
      // Update existing student with Microsoft info
      student.name = microsoftUser.displayName || student.name;
      student.microsoftId = microsoftUser.id;
      if (normalizedRequestedRole) {
        student.role = normalizedRequestedRole;
      }
      if (microsoftUser.department) {
        student.department = microsoftUser.department;
      }
      await student.save();
    }

    // Generate JWT token with user's actual role
    const token = generateToken(student._id, student.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        department: student.department,
        role: student.role || 'student',
      },
    });
  } catch (error) {
    console.error('Microsoft OAuth error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.data?.error === 'invalid_client') {
      return res.status(401).json({
        message: 'Invalid Microsoft OAuth credentials',
        error: error.response.data.error_description,
        hint: 'Please check your MICROSOFT_CLIENT_SECRET in server/.env. Make sure you copied the secret VALUE (not the secret ID) from Azure Portal.',
        instructions: [
          '1. Go to Azure Portal > App registrations > Your app',
          '2. Navigate to Certificates & secrets',
          '3. If secret has expired, create a new one',
          '4. Copy the secret VALUE immediately (you can only see it once)',
          '5. Update MICROSOFT_CLIENT_SECRET in server/.env',
          '6. Restart the server',
        ],
      });
    }

    if (error.response?.data?.error === 'invalid_grant') {
      return res.status(401).json({
        message: 'Invalid authorization code',
        error: error.response.data.error_description,
        hint: 'The authorization code may have expired. Please try logging in again.',
      });
    }

    res.status(500).json({
      message: 'Authentication failed',
      error: error.response?.data?.error_description || error.message,
    });
  }
});

// Get Microsoft OAuth URL
router.get('/microsoft/url', (req, res) => {
  // Validate environment variables
  if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_TENANT_ID || !process.env.MICROSOFT_REDIRECT_URI) {
    return res.status(500).json({
      message: 'Server configuration error: Microsoft OAuth credentials are not configured',
      hint: 'Please check server/.env file and ensure MICROSOFT_CLIENT_ID, MICROSOFT_TENANT_ID, and MICROSOFT_REDIRECT_URI are set',
    });
  }

  const allowedRoles = new Set(['student', 'coordinator', 'convenor', 'club', 'admin']);
  const requestedRole =
    typeof req.query.role === 'string' && allowedRoles.has(req.query.role) ? req.query.role : undefined;

  const authUrl = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize?` +
    `client_id=${process.env.MICROSOFT_CLIENT_ID}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(process.env.MICROSOFT_REDIRECT_URI)}&` +
    `response_mode=query&` +
    `scope=openid profile email User.Read&` +
    (requestedRole ? `&state=${encodeURIComponent(requestedRole)}` : '');

  res.json({ authUrl });
});

export default router;
