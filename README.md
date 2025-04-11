# NFC Dashboard Server

A Node.js/Express backend server for the NFC Dashboard application, providing API endpoints for user profiles, appointments, and NFC tag management.

## Features

- Google OAuth Authentication
- User Profile Management
- Appointment Scheduling
- NFC Tag Management
- RESTful API
- TypeScript Support
- MongoDB Database
- JWT Authentication
- Session Management

## Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 4.4
- Google OAuth 2.0 credentials

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nfc-dashboard-server.git
cd nfc-dashboard-server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and configure the following variables:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Session Configuration
SESSION_SECRET=your_session_secret
SESSION_COOKIE_MAX_AGE=86400000

# Frontend URL
FRONTEND_BASE_URL=http://localhost:3000

# Security
CORS_ORIGIN=http://localhost:3000,https://your-production-domain.com
```

## Development

Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:5000 (or the port specified in your .env file).

## Production

Build the project:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## API Documentation

### Authentication

- `POST /api/auth/google` - Google OAuth authentication
- `GET /api/auth/verify` - Verify JWT token

### Profiles

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profiles` - Create new profile with slug
- `GET /api/profiles/:slug` - Get profile by slug

### Appointments

- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

## Testing

Run tests:
```bash
npm test
```

## Security

- All endpoints except authentication are protected with JWT
- CORS is configured for specific origins
- Security headers are implemented
- Session management with secure cookies
- Environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 