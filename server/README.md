# NFC Dashboard Backend Server

This is the backend server for the NFC Dashboard application, a digital business card platform.

## Features

- Profile management API
- Unique slug generation for shareable profiles
- Appointment scheduling
- Device-based ownership verification
- MongoDB Atlas integration

## Setup

### Prerequisites

- Node.js (>= 14.x)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the server directory
```
cd nfc-dashboard/server
```

3. Install dependencies
```
npm install
```

4. Create a `.env` file in the server directory with the following variables:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/nfc-dashboard
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=30d
ADMIN_PASSWORD=your_admin_password
ADMIN_TOKEN=your_admin_token
```

5. Start the server
```
npm run dev
```

The server will run on port 5000 by default.

### MongoDB Atlas Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string and replace `your_username`, `your_password`, and `your_cluster` in the MONGODB_URI above
5. Add your IP address to the allowlist in the Network Access settings

## API Endpoints

### Profiles

- `POST /api/profile` - Create or update a profile
- `GET /api/profile/:username` - Get profile by username
- `GET /api/profile/slug/:slug` - Get profile by slug
- `POST /api/profile/slug/:slug` - Update profile by slug
- `POST /api/profile/slug/:slug/claim` - Claim ownership of a profile

### Slugs

- `POST /api/slugs` - Generate a new unique slug
- `GET /api/slugs/:slug` - Check if a slug is valid
- `DELETE /api/slugs/:slug` - Deactivate a slug (admin only)

### Appointments

- `POST /api/appointments` - Create a new appointment
- `POST /api/appointments/profile/:username` - Get all appointments for a profile
- `PUT /api/appointments/:id` - Update appointment status

## Deployment

For production deployment:

1. Update the `.env` file with production settings
2. Set `NODE_ENV=production`
3. Use a process manager like PM2:
```
npm install -g pm2
pm2 start server.js
```

## Frontend Integration

The frontend should use the environment variable `NEXT_PUBLIC_API_BASE_URL` to connect to this server:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
``` 