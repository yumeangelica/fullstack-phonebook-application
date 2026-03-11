# Fullstack Phonebook Application

A modern phonebook application with user authentication, real-time validation, international phone number support, and comprehensive testing. Built with React, Node.js, Express, and MongoDB.

Originally created for the Full Stack Open course in 2023, significantly modernized and enhanced in 2026 with improved architecture, authentication, validation, testing, and production-ready features.

## Features

- **User authentication** — register, login, logout, and delete account
- **Per-user phonebook** — each user has their own private contacts
- Add, edit, delete, and search contacts
- Real-time form validation with visual feedback
- International phone number validation with country codes
- Finnish phone number normalization (removes leading zero)
- Responsive design for desktop and mobile
- Search and filter functionality
- Pagination for large contact lists
- Comprehensive error handling

## Tech Stack

**Frontend:** React 19, Webpack 5, libphonenumber-js
**Backend:** Node.js 22, Express 5, MongoDB, Mongoose 9
**Auth:** jose (JWT HS256), bcrypt
**Testing:** Node.js built-in test runner (`node:test`), supertest
**Development:** Concurrently, ESLint 9 (flat config)

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm
- MongoDB (local or MongoDB Atlas)

### Installation

```bash
git clone <repository-url>
cd fullstack-phonebook-application
npm install
```

### Environment Setup

Create `.env` file:

```
MONGODB_URI=your-mongodb-uri
TEST_MONGODB_URI=your-test-mongodb-uri
JWT_SECRET=your-secret-key
PORT=5001
```

### Development

```bash
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:5001

### Production

```bash
npm run build
npm start
```

## Scripts

- `npm run dev` - Start development servers (backend + frontend)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run all tests
- `npm run test:frontend` - Run React component tests
- `npm run test:backend` - Run API and model tests
- `npm run test:watch` - Run backend tests in watch mode
- `npm run lint` - Run ESLint

## API Endpoints

### Authentication (public)

```
POST   /api/auth/register - Register a new user
POST   /api/auth/login    - Login and receive JWT token
```

### Authentication (requires token)

```
GET    /api/auth/me        - Get current user info
DELETE /api/auth/me        - Delete account and all contacts
```

### Contacts (requires token)

```
GET    /api/persons        - Get all contacts (with search/pagination)
POST   /api/persons        - Create new contact
GET    /api/persons/:id    - Get specific contact
PUT    /api/persons/:id    - Update contact
DELETE /api/persons/:id    - Delete contact
GET    /api/stats          - Get user's statistics
```

### Health (public)

```
GET    /health             - Health check
GET    /ready              - Readiness probe
GET    /live               - Liveness probe
```

## Validation

**Username:** 3-30 characters, lowercase letters, numbers, hyphens, underscores
**Password:** Minimum 8 characters
**Names:** 3-50 characters, letters/spaces/hyphens/apostrophes only, Unicode support
**Phone:** International format with country codes, real-world validation using libphonenumber-js

## Project Structure

```
├── client/              # React frontend
│   ├── components/      # React components with tests
│   ├── css/             # Styling
│   ├── hooks/           # Custom hooks (useAuth, usePersons, useNotification)
│   ├── services/        # API services (native fetch)
│   ├── utils/           # Validation utilities
│   └── test-setup.js    # jsdom setup for frontend tests
├── server/              # Express backend
│   ├── controllers/     # Route handlers (auth, api, health, index)
│   ├── middleware/      # Auth, error handling, logging, security
│   ├── models/          # Mongoose models (User, Person)
│   ├── tests/           # Backend tests (supertest)
│   └── utils/           # Config, database, and auth utilities
├── eslint.config.js     # ESLint flat config
├── index.html           # HTML template
└── index.js             # Server entry point
```

## Credits

Created by yumeangelica (yumeangelica.github.io)

## License

MIT
