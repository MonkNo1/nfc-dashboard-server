# Deploying NFC Dashboard to Render

This guide provides step-by-step instructions for deploying the NFC Dashboard backend to Render.

## Prerequisites

- A Render account
- Your code pushed to a Git repository (GitHub, GitLab, etc.)
- MongoDB Atlas account with a configured cluster

## Backend Deployment Steps

### 1. Create a Web Service on Render

1. Log in to your Render account
2. Click "New" and select "Web Service"
3. Connect your GitHub/GitLab repository or use "Public Git repository" option

### 2. Configure the Web Service

- **Name**: `nfc-dashboard-api` (or your preferred name)
- **Root Directory**: `nfc-dashboard/server`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Runtime Environment**: Node
- **Plan**: Free (or select a paid plan for production use)

### 3. Environment Variables

Add the following environment variables under the "Environment" section:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/nfc-dashboard
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d
SESSION_SECRET=your_session_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_BASE_URL=https://your-frontend-url.vercel.app
ADMIN_PASSWORD=your_admin_password
ADMIN_TOKEN=your_admin_token
```

> **Important**: Replace the placeholder values with your actual MongoDB connection string and secure values for JWT_SECRET, ADMIN_PASSWORD, and ADMIN_TOKEN.

### 4. Deploy

- Click "Create Web Service"
- Render will build and deploy your application
- Once deployed, you'll receive a URL like `https://nfc-dashboard-api.onrender.com`

## Troubleshooting

### Common Issues

1. **Build Fails**: Make sure your package.json has a "build" script
2. **MongoDB Connection Errors**: Check your MongoDB URI, ensure network access is allowed
3. **Missing Environment Variables**: Verify all required variables are set in Render
4. **CORS Issues**: Update the allowed origins in corsOptions in server.js

### Logs

To check logs for errors:
1. Go to your Web Service in Render
2. Click on "Logs"
3. Filter logs by "System" or "Application"

## Updating Your Deployment

- Push changes to your connected repository
- Render will automatically rebuild and deploy your application

## Frontend Integration

After deploying your backend, set the frontend environment variable:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.onrender.com
```

Replace `your-backend-url` with your actual Render backend URL. 