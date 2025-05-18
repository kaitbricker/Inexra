# Inexra Analytics Dashboard

A modern, real-time analytics dashboard built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Real-time user activity tracking
- Advanced analytics with customizable charts
- Template performance monitoring
- API rate limiting and caching
- Dark mode support
- Responsive design
- Comprehensive test coverage

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Framer Motion
- **Charts**: Recharts
- **State Management**: React Hooks
- **API**: Next.js API Routes
- **Database**: Prisma with PostgreSQL
- **Caching**: Redis
- **Real-time**: Socket.IO
- **Testing**: Jest, React Testing Library
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js 18.x or later
- Redis server
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/inexra-analytics.git
   cd inexra-analytics
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration.

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js
- `NEXTAUTH_URL`: Base URL of your application

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:coverage
```

### Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format
```

## Project Structure

```
src/
├── components/
│   ├── analytics/
│   │   ├── Dashboard.tsx
│   │   └── ...
│   └── common/
│       ├── Button.tsx
│       └── ...
├── hooks/
│   ├── useTheme.ts
│   └── ...
├── lib/
│   ├── cache.ts
│   ├── prisma.ts
│   └── socket.ts
├── pages/
│   ├── api/
│   │   └── analytics/
│   │       ├── users.ts
│   │       ├── templates.ts
│   │       └── activity.ts
│   └── ...
└── tests/
    ├── components/
    └── api/
```

## API Endpoints

### Analytics

- `GET /api/analytics/users`: User engagement metrics
- `GET /api/analytics/templates`: Template performance metrics
- `GET /api/analytics/activity`: Real-time user activity

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Socket.IO](https://socket.io/)
- [Prisma](https://www.prisma.io/)
- [Redis](https://redis.io/) 