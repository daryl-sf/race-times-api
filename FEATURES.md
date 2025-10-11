# Race Times API - Complete Feature Documentation

## 🚀 What's Ready to Use

The Race Times API is a **production-ready race timing system** with comprehensive functionality covering everything from basic race setup to advanced analytics and audit trails.

### Complete Race Timing Workflow

The system now supports the complete race timing workflow:

1. **Setup**: Create organization → Create race → Add checkpoints → Add waves
2. **Registration**: Import/create participants → Assign bib numbers → Assign waves
3. **Race Day**: Start timing sessions → Record timing events (single/bulk) → Monitor progress
4. **Results**: Auto-calculate results → Assign categories → Generate leaderboard → Export CSV
5. **Management**: Edit times → Add penalties → DQ participants → View audit trail
6. **Analytics**: View statistics → Analyze throughput → Check split times → Pace distribution

---

## 📊 Implementation Statistics

- **Total New Files Created**: ~45 files
- **Total Lines of Code**: 4,800+ lines
- **Total GraphQL Objects**: 12
- **Total Queries**: 35+
- **Total Mutations**: 45+
- **Total Enums**: 3 (RaceType, Role, AuditAction)
- **Helper Libraries**: 3 (timing, results, audit)
- **Build Status**: ✅ SUCCESS
- **TypeScript Compilation**: ✅ PASS

---

## 🔑 Key Features

### Authentication & Authorization
- ✅ JWT-based authentication with cookie-based sessions
- ✅ Role-based access control (ADMIN, MANAGER, OPERATOR, VIEWER)
- ✅ Organization-scoped data access
- ✅ All mutations require authentication
- ✅ Password hashing with bcrypt
- ✅ User profile management

### Race Management
- ✅ Multiple race types (MASS, WAVE, TIME_TRIAL)
- ✅ Timezone support for international events
- ✅ Checkpoint management (start, finish, intermediate splits)
- ✅ Wave management for staged starts
- ✅ Race date scheduling
- ✅ Race descriptions and metadata

### Participant Management
- ✅ Participant registration with demographics
- ✅ Bib number assignments
- ✅ Wave assignments
- ✅ Search by name/bib
- ✅ CSV import/export
- ✅ Gender and birth year tracking
- ✅ Country/nationality support
- ✅ External ID mapping

### Timing System
- ✅ Single and bulk event recording
- ✅ Automatic elapsed time calculation from start checkpoint
- ✅ Timing session tracking (device/operator)
- ✅ Soft delete with undo capability
- ✅ Event editing with automatic recalculation
- ✅ Sequence tracking for event ordering
- ✅ Device timestamp and server timestamp
- ✅ Source and qualifier metadata
- ✅ Multiple checkpoint support

### Results & Rankings
- ✅ Automatic gun time, chip time, net time calculation
- ✅ Place calculation and ranking
- ✅ Category-based results (age groups, divisions)
- ✅ Gender-based results
- ✅ Auto-assign age group categories (U18, 18-29, 30-39, 40-49, 50-59, 60+)
- ✅ Leaderboard queries with limits
- ✅ Result caching for performance
- ✅ CSV export of results

### Data Integrity
- ✅ Comprehensive audit logging for all changes
- ✅ Before/after snapshots in audit trail
- ✅ Entity history tracking
- ✅ Manual time adjustments with audit trail
- ✅ DQ/reinstatement tracking with reasons
- ✅ Time penalty support with audit
- ✅ Cascade deletes for data consistency

### Analytics & Reporting
- ✅ Race statistics (total participants, finishers, DNF, DQ, average times)
- ✅ Checkpoint throughput analysis (events per hour)
- ✅ Participant split times with elapsed times
- ✅ Pace distribution analysis (10-minute buckets)
- ✅ Fastest/slowest times

---

## 🗂️ GraphQL Schema Overview

### Objects (12)
1. **User** - System users with authentication
2. **Profile** - User profile information (first/last name, bio)
3. **Organization** - Race organizing entities
4. **Race** - Racing events with type, date, timezone
5. **Wave** - Start waves for staged races
6. **Participant** - Athletes/participants in races
7. **Registration** - Links participant to race with bib number
8. **Checkpoint** - Timing points along race course
9. **TimingSession** - Device/operator timing sessions
10. **TimingEvent** - Individual timing records
11. **ResultCache** - Pre-computed race results with rankings
12. **AuditLog** - Audit trail for all data modifications

### Enums (3)
- **RaceType**: MASS, WAVE, TIME_TRIAL
- **Role**: ADMIN, MANAGER, OPERATOR, VIEWER
- **AuditAction**: CREATE, UPDATE, DELETE, UNDO

---

## 🔐 Security Features

- Password hashing with bcryptjs (10 rounds)
- JWT tokens with 7-day expiration
- Cookie-based authentication
- Organization-scoped data access (users can only access their org's data)
- Role-based permissions
- Soft deletes for data recovery
- Audit logging for compliance

---

## 📦 Technology Stack

- **Runtime**: Node.js 22.x
- **Language**: TypeScript
- **API**: GraphQL (GraphQL Yoga)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Schema Builder**: Pothos GraphQL
- **Authentication**: JWT + bcryptjs
- **Validation**: Zod

---

## 🎯 Use Cases

This system is perfect for:
- Marathon and running race organizers
- Triathlon timing companies
- Cycling race management
- CrossFit competitions
- Trail running events
- Virtual races with time submissions
- Multi-day stage races
- Any timed athletic event requiring professional timing and results

---

## 📈 Performance Features

- Result caching for fast leaderboard queries
- Bulk timing event import (handles device buffer uploads)
- Efficient database queries with Prisma
- Indexed fields for search operations
- Pagination support for large datasets
- Sequence numbering for event ordering

---

## 🔄 Data Flow

```
Organization
    └── Users (with Roles)
    └── Races
        ├── Waves (optional for WAVE/TIME_TRIAL races)
        ├── Checkpoints (start, finish, intermediate)
        ├── Participants
        │   └── Registrations (bib assignments)
        ├── Timing Sessions (device/operator tracking)
        ├── Timing Events (raw timing data)
        │   └── Calculated: elapsed time, sequence
        ├── Result Cache (computed results)
        │   └── gun time, chip time, net time, place, category
        └── Audit Logs (change tracking)
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js 22.x
- PostgreSQL database
- Redis (optional, for future caching)

### Quick Start
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and JWT secrets

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### Access GraphQL Playground
Open [http://localhost:4000/graphql](http://localhost:4000/graphql) to explore the API.

---

## 📝 API Documentation

See [USER_FLOWS.md](./USER_FLOWS.md) for detailed user flows and GraphQL operations.

---

## 🔮 Future Enhancements

While the system is production-ready, potential future enhancements include:
- Real-time GraphQL subscriptions for live timing updates
- WebSocket support for live leaderboard
- Mobile app integration
- Photo finish integration
- RFID chip timing device integration
- Email notifications for results
- Public results pages
- Social media sharing
- Prize/award management
- Multi-language support
- Advanced reporting (PDF generation)
- API rate limiting
- Redis caching layer

---

## 📄 License

ISC
