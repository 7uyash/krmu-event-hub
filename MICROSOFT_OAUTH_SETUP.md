# Microsoft OAuth Setup Guide

## Common Error: Invalid Client Secret

If you see the error: **"Invalid client secret provided"**, follow these steps:

### Problem
The error occurs when:
- The client secret value is incorrect
- The secret has expired (Azure secrets expire after 6, 12, or 24 months)
- The secret ID was used instead of the secret VALUE

### Solution

1. **Go to Azure Portal**
   - Navigate to [Azure Portal](https://portal.azure.com)
   - Go to **Azure Active Directory** > **App registrations**
   - Select your app (E-Attend)

2. **Check Existing Secrets**
   - Go to **Certificates & secrets** in the left menu
   - Look at existing secrets in the "Client secrets" section
   - Check the "Expires" column - if expired, you need a new one

3. **Create New Client Secret (if needed)**
   - Click **New client secret**
   - Add a description: "E-Attend Production" or "E-Attend Development"
   - Choose expiration: 6, 12, or 24 months (recommended: 24 months)
   - Click **Add**

4. **Copy the Secret VALUE (Important!)**
   - **IMMEDIATELY** copy the secret **VALUE** (not the Secret ID)
   - The VALUE looks like: `abc123~XYZ.def456ghi789jkl012mno345pqr678`
   - You can only see this value once - if you navigate away, you cannot retrieve it
   - The Secret ID (like `abc12345-1234-1234-1234-123456789abc`) is NOT what you need

5. **Update Environment Variable**
   - Open `server/.env` file
   - Update `MICROSOFT_CLIENT_SECRET` with the secret VALUE you copied:
     ```env
     MICROSOFT_CLIENT_SECRET=abc123~XYZ.def456ghi789jkl012mno345pqr678
     ```
   - Make sure there are no extra spaces or quotes
   - Save the file

6. **Restart the Server**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev:server
   ```

### Quick Checklist

- [ ] Client secret VALUE (not ID) is in `server/.env`
- [ ] No extra spaces or quotes around the secret value
- [ ] Secret has not expired
- [ ] Server has been restarted after updating `.env`
- [ ] All environment variables are set:
  - `MICROSOFT_CLIENT_ID`
  - `MICROSOFT_CLIENT_SECRET`
  - `MICROSOFT_TENANT_ID`
  - `MICROSOFT_REDIRECT_URI`

### Verification

1. Check if environment variables are loaded:
   ```bash
   # In server/.env, make sure all variables are set
   # No placeholder values like "your-azure-app-client-secret"
   ```

2. Test the configuration:
   - Try logging in at `/auth/student`
   - Check server logs for any configuration errors
   - If error persists, verify secret was copied correctly

### Other Common Issues

**Issue: "invalid_grant" error**
- The authorization code expired (they expire after ~5 minutes)
- Solution: Try logging in again

**Issue: "redirect_uri_mismatch"**
- The redirect URI doesn't match Azure configuration
- Solution: Ensure `MICROSOFT_REDIRECT_URI` in `.env` exactly matches the redirect URI in Azure Portal

**Issue: "unauthorized_client"**
- The client is not authorized for the requested scope
- Solution: Check API permissions in Azure Portal and ensure admin consent is granted

### Need Help?

If issues persist:
1. Double-check all environment variables in `server/.env`
2. Verify Azure App Registration configuration
3. Check server logs for detailed error messages
4. Ensure all API permissions are granted with admin consent
