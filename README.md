# Race Times API

A GraphQL API for managing race times and user profiles, built with Node.js, TypeScript, GraphQL Yoga, and Prisma.

## Tech Stack

- **Runtime**: Node.js 22.x
- **Language**: TypeScript
- **API**: GraphQL (GraphQL Yoga)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis (ready for integration)
- **Schema Builder**: Pothos GraphQL
- **Authentication**: JWT with cookie-based sessions

## Features

- User authentication with JWT
- User profiles management
- GraphQL API with type-safe schema
- Cookie-based authentication
- PostgreSQL database with Prisma ORM
- Docker containerization with Docker Compose

## Prerequisites

- Node.js 22.x
- Docker and Docker Compose (for containerized setup)
- PostgreSQL (if running locally without Docker)

## Getting Started

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd race-times-api
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update the JWT secrets:
   ```env
   JWT_SECRET="your-secure-secret-key"
   JWT_REFRESH_SECRET="your-secure-refresh-secret-key"
   ```

3. **Start all services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Redis on port 6379
   - API server on port 4000

4. **Access the GraphQL Playground**

   Open your browser to [http://localhost:4000/graphql](http://localhost:4000/graphql)

### Local Development (Without Docker)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL database**

   Create a PostgreSQL database and update `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/race_times?schema=public"
   ```

3. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

4. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server

### Prisma
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations (dev)
- `npm run prisma:studio` - Open Prisma Studio GUI
- `npm run prisma:seed` - Seed the database

### Docker Commands
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop services and remove volumes
docker-compose down -v

# View API logs
docker-compose logs -f api

# View all logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build

# Access API container shell
docker-compose exec api sh

# Run migrations in container
docker-compose exec api npx prisma migrate deploy

# Open Prisma Studio in container
docker-compose exec api npx prisma studio
```

## Database Schema

### User
- Email and password authentication
- Admin and active status flags
- Last login tracking
- One-to-one profile relationship

### Profile
- User profile information
- First name, last name, bio
- Cascade delete with User

## GraphQL API

The API is available at `/graphql` and includes:

### Queries
- User queries (authentication required)

### Mutations
- `createUser` - Register a new user
- `login` - Authenticate user and receive tokens

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | `redis://redis:6379` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | - |

## Docker Services

The Docker Compose setup includes:

- **postgres**: PostgreSQL 16 Alpine
  - Port: 5432
  - Volume: `postgres_data`
  - Health checks enabled

- **redis**: Redis 7 Alpine
  - Port: 6379
  - Volume: `redis_data`
  - AOF persistence enabled

- **api**: Node.js API
  - Port: 4000
  - Auto-migration on startup
  - Depends on healthy postgres and redis

## Project Structure

```
race-times-api/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── context/           # GraphQL context
│   ├── lib/               # Utilities (auth, prisma)
│   ├── schema/            # GraphQL schema
│   │   ├── builder.ts     # Pothos schema builder
│   │   ├── mutations/     # GraphQL mutations
│   │   ├── objects/       # GraphQL object types
│   │   └── queries/       # GraphQL queries
│   ├── index.ts           # Application entry point
│   └── seed.ts            # Database seeding
├── Dockerfile             # Docker image definition
├── docker-compose.yml     # Multi-container setup
├── .dockerignore          # Docker build exclusions
└── package.json           # Dependencies and scripts
```

## Development Workflow

1. Make schema changes in `prisma/schema.prisma`
2. Create a migration: `npm run prisma:migrate`
3. Update GraphQL schema in `src/schema/`
4. Test changes using GraphQL Playground
5. Build and deploy with Docker

## Production Deployment

1. Update environment variables with production values
2. Build the Docker image: `docker-compose build`
3. Start services: `docker-compose up -d`
4. Migrations run automatically on startup

## Security Notes

- Change default database credentials in production
- Use strong, unique JWT secrets
- Enable HTTPS in production
- Review and update CORS settings
- Implement rate limiting for API endpoints

## License

ISC
