# Fullstack Phonebook Application

A modern phonebook application with real-time validation, international phone number support, and comprehensive testing. Built with React, Node.js, Express, and MongoDB.

Originally created for the Full Stack Open course in 2023, significantly modernized and enhanced in 2025 with improved architecture, validation, testing, and production-ready features.

## Features

- Add, edit, delete, and search contacts
- Real-time form validation with visual feedback
- International phone number validation with country codes
- Finnish phone number normalization (removes leading zero)
- Responsive design for desktop and mobile
- Search and filter functionality
- Pagination for large contact lists
- Comprehensive error handling

## Tech Stack

**Frontend:** React, React Bootstrap, Webpack, libphonenumber-js
**Backend:** Node.js, Express.js, MongoDB, Mongoose
**Testing:** Jest for both frontend and backend
**Development:** Nodemon, Concurrently, ESLint

## Quick Start

### Prerequisites

- Node.js >= 20.18.0
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

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run all tests
- `npm run test:frontend` - Run React component tests
- `npm run test:backend` - Run API and model tests
- `npm run lint` - Run ESLint

## API Endpoints

```
GET    /api/persons       - Get all contacts (with search/pagination)
POST   /api/persons       - Create new contact
GET    /api/persons/:id   - Get specific contact
PUT    /api/persons/:id   - Update contact
DELETE /api/persons/:id   - Delete contact
GET    /api/stats         - Get application statistics
GET    /health            - Health check
```

## Validation

**Names:** 3-50 characters, letters/spaces/hyphens/apostrophes only, Unicode support
**Phone:** International format with country codes, real-world validation using libphonenumber-js

## Project Structure

```
├── client/              # React frontend
│   ├── components/      # React components
│   ├── css/            # Styling
│   └── services/       # API services
├── server/             # Express backend
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Mongoose models
│   ├── tests/          # Test files
│   └── utils/          # Database utilities
├── build/              # Production build
└── index.js           # Server entry point
```

## Credits

Created by yumeangelica (yumeangelica.github.io)

## License

MIT
