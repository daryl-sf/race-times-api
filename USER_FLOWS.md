# Race Times API - User Flows & GraphQL Operations

This document defines all user flows in the Race Times API, including the specific queries and mutations used in each workflow.

---

## Table of Contents

1. [Authentication & User Management](#1-authentication--user-management)
2. [Organization Setup](#2-organization-setup)
3. [Race Setup & Configuration](#3-race-setup--configuration)
4. [Participant Registration](#4-participant-registration)
5. [Race Day Operations](#5-race-day-operations)
6. [Results Management](#6-results-management)
7. [Post-Race Operations](#7-post-race-operations)
8. [Analytics & Reporting](#8-analytics--reporting)
9. [Data Management & Auditing](#9-data-management--auditing)

---

## 1. Authentication & User Management

### 1.1 User Registration & Login Flow

**Actor**: New User / Admin

**Steps**:

1. **Admin creates user account**
   ```graphql
   mutation CreateUser {
     createUser(
       email: "john@example.com"
       password: "securePassword123"
       organizationId: "org_123"
       role: OPERATOR
       firstName: "John"
       lastName: "Doe"
     ) {
       id
       email
       role
       profile {
         firstName
         lastName
       }
     }
   }
   ```

2. **User logs in**
   ```graphql
   mutation Login {
     login(
       email: "john@example.com"
       password: "securePassword123"
     ) {
       id
       email
       role
       profile {
         firstName
         lastName
       }
     }
   }
   ```
   *Note: JWT token is automatically set in cookie*

3. **Get current user info**
   ```graphql
   query Me {
     me {
       id
       email
       role
       organizationId
       profile {
         firstName
         lastName
         displayName
         bio
       }
       createdAt
     }
   }
   ```

### 1.2 User Profile Management

**Actor**: Logged-in User

**Operations**:

1. **Update own profile**
   ```graphql
   mutation UpdateProfile {
     updateProfile(
       firstName: "Jonathan"
       lastName: "Doe"
       bio: "Race timing operator with 5 years experience"
     )
   }
   ```

2. **Change password**
   ```graphql
   mutation ChangePassword {
     changePassword(
       currentPassword: "oldPassword123"
       newPassword: "newSecurePassword456"
     )
   }
   ```

### 1.3 User Administration

**Actor**: Admin/Manager

**Operations**:

1. **List all users in organization**
   ```graphql
   query Users {
     users {
       id
       email
       role
       profile {
         firstName
         lastName
       }
       lastLoginAt
       createdAt
     }
   }
   ```

2. **Get specific user**
   ```graphql
   query GetUser($id: String!) {
     user(id: $id) {
       id
       email
       role
       organizationId
       profile {
         firstName
         lastName
         displayName
       }
     }
   }
   ```

3. **Update user details**
   ```graphql
   mutation UpdateUser {
     updateUser(
       id: "user_123"
       email: "newemail@example.com"
       role: MANAGER
     ) {
       id
       email
       role
     }
   }
   ```

4. **Assign role to user**
   ```graphql
   mutation AssignRole {
     assignRole(
       userId: "user_123"
       role: ADMIN
     ) {
       id
       email
       role
     }
   }
   ```

---

## 2. Organization Setup

### 2.1 Organization Creation & Management

**Actor**: Super Admin

**Steps**:

1. **Create new organization**
   ```graphql
   mutation CreateOrganization {
     createOrganization(
       name: "City Marathon Events Inc."
       timezone: "America/New_York"
     ) {
       id
       name
       timezone
       createdAt
     }
   }
   ```

2. **Update organization**
   ```graphql
   mutation UpdateOrganization {
     updateOrganization(
       id: "org_123"
       name: "City Marathon Events International"
       timezone: "America/Los_Angeles"
     ) {
       id
       name
       timezone
     }
   }
   ```

3. **View my organization**
   ```graphql
   query MyOrganization {
     myOrganization {
       id
       name
       timezone
       createdAt
       users {
         id
         email
         role
         profile {
           firstName
           lastName
         }
       }
       races {
         id
         name
         startDate
         raceType
       }
     }
   }
   ```

4. **List all organizations** (Super Admin only)
   ```graphql
   query AllOrganizations {
     organizations {
       id
       name
       timezone
       createdAt
     }
   }
   ```

---

## 3. Race Setup & Configuration

### 3.1 Race Creation Flow

**Actor**: Manager/Admin

**Steps**:

1. **Create race**
   ```graphql
   mutation CreateRace {
     createRace(
       name: "City Marathon 2025"
       description: "Annual city marathon with 5K, 10K, and full marathon distances"
       startDate: "2025-06-15T07:00:00Z"
       timezone: "America/New_York"
       raceType: WAVE
     ) {
       id
       name
       description
       startDate
       timezone
       raceType
       organization {
         name
       }
     }
   }
   ```

2. **Update race details**
   ```graphql
   mutation UpdateRace {
     updateRace(
       id: "race_123"
       name: "City Marathon 2025 - Updated"
       description: "Updated description with new route information"
       startDate: "2025-06-15T06:30:00Z"
     ) {
       id
       name
       description
       startDate
     }
   }
   ```

### 3.2 Checkpoint Setup

**Actor**: Manager/Admin

**Steps**:

1. **Create start checkpoint**
   ```graphql
   mutation CreateStartCheckpoint {
     createCheckpoint(
       raceId: "race_123"
       code: "START"
       name: "Start Line"
       positionMeters: 0
       isStart: true
       isFinish: false
       orderIndex: 0
     ) {
       id
       code
       name
       isStart
       orderIndex
     }
   }
   ```

2. **Create intermediate checkpoints**
   ```graphql
   mutation CreateCheckpoint5K {
     createCheckpoint(
       raceId: "race_123"
       code: "5K"
       name: "5 Kilometer Mark"
       positionMeters: 5000
       isStart: false
       isFinish: false
       orderIndex: 1
     ) {
       id
       code
       name
       positionMeters
       orderIndex
     }
   }
   ```

3. **Create finish checkpoint**
   ```graphql
   mutation CreateFinishCheckpoint {
     createCheckpoint(
       raceId: "race_123"
       code: "FINISH"
       name: "Finish Line"
       positionMeters: 42195
       isStart: false
       isFinish: true
       orderIndex: 5
     ) {
       id
       code
       name
       isFinish
       orderIndex
     }
   }
   ```

4. **Update checkpoint**
   ```graphql
   mutation UpdateCheckpoint {
     updateCheckpoint(
       id: "checkpoint_123"
       name: "5K Water Station"
       positionMeters: 5100
     ) {
       id
       name
       positionMeters
     }
   }
   ```

5. **Delete checkpoint**
   ```graphql
   mutation DeleteCheckpoint {
     deleteCheckpoint(id: "checkpoint_123")
   }
   ```

### 3.3 Wave Setup (for WAVE races)

**Actor**: Manager/Admin

**Steps**:

1. **Create waves**
   ```graphql
   mutation CreateWaveA {
     createWave(
       raceId: "race_123"
       name: "Wave A - Elite Runners"
       scheduledStart: "2025-06-15T07:00:00Z"
       position: 1
     ) {
       id
       name
       scheduledStart
       position
     }
   }
   ```

   ```graphql
   mutation CreateWaveB {
     createWave(
       raceId: "race_123"
       name: "Wave B - Age Group 18-39"
       scheduledStart: "2025-06-15T07:15:00Z"
       position: 2
     ) {
       id
       name
       scheduledStart
       position
     }
   }
   ```

2. **Update wave**
   ```graphql
   mutation UpdateWave {
     updateWave(
       id: "wave_123"
       scheduledStart: "2025-06-15T07:10:00Z"
       position: 2
     ) {
       id
       scheduledStart
       position
     }
   }
   ```

3. **Reorder waves**
   ```graphql
   mutation ReorderWaves {
     reorderWaves(
       raceId: "race_123"
       waveIds: ["wave_002", "wave_001", "wave_003"]
     )
   }
   ```

4. **Delete wave**
   ```graphql
   mutation DeleteWave {
     deleteWave(id: "wave_123")
   }
   ```

5. **Query waves**
   ```graphql
   query GetWaves($raceId: String!) {
     waves(raceId: $raceId) {
       id
       name
       scheduledStart
       position
       registrations {
         id
         bib
         participant {
           firstName
           lastName
         }
       }
     }
   }
   ```

### 3.4 View Race Configuration

**Actor**: Any authenticated user

**Query**:

```graphql
query GetRaceDetails($raceId: String!) {
  race(id: $raceId) {
    id
    name
    description
    startDate
    timezone
    raceType
    organization {
      name
      timezone
    }
    checkpoints {
      id
      code
      name
      positionMeters
      isStart
      isFinish
      orderIndex
    }
    waves {
      id
      name
      scheduledStart
      position
    }
    participants {
      id
      firstName
      lastName
    }
  }
}
```

---

## 4. Participant Registration

### 4.1 Manual Participant Registration

**Actor**: Operator/Manager

**Steps**:

1. **Create participant**
   ```graphql
   mutation CreateParticipant {
     createParticipant(
       raceId: "race_123"
       firstName: "Jane"
       lastName: "Smith"
       gender: "F"
       birthYear: 1990
       country: "USA"
     ) {
       id
       firstName
       lastName
       fullName
       gender
       birthYear
       country
     }
   }
   ```

2. **Create registration with bib**
   ```graphql
   mutation CreateRegistration {
     createRegistration(
       participantId: "participant_123"
       bib: "1001"
       waveId: "wave_a"
       seededPosition: 1
     ) {
       id
       bib
       seededPosition
       participant {
         firstName
         lastName
       }
       wave {
         name
         scheduledStart
       }
     }
   }
   ```

3. **Update participant info**
   ```graphql
   mutation UpdateParticipant {
     updateParticipant(
       id: "participant_123"
       firstName: "Janet"
       country: "Canada"
     ) {
       id
       firstName
       country
     }
   }
   ```

4. **Update registration**
   ```graphql
   mutation UpdateRegistration {
     updateRegistration(
       id: "registration_123"
       bib: "1002"
       waveId: "wave_b"
     ) {
       id
       bib
       wave {
         name
       }
     }
   }
   ```

### 4.2 Bulk Participant Import

**Actor**: Manager/Admin

**Steps**:

1. **Import participants from CSV**
   ```graphql
   mutation ImportParticipants {
     importParticipants(
       raceId: "race_123"
       csvData: """
       firstName,lastName,gender,birthYear,country,bib
       John,Doe,M,1985,USA,1001
       Jane,Smith,F,1990,USA,1002
       Mike,Johnson,M,1988,Canada,1003
       """
     )
   }
   ```
   *Returns: Count of imported participants*

2. **Export participants to CSV**
   ```graphql
   query ExportParticipants {
     exportParticipants(raceId: "race_123")
   }
   ```
   *Returns: CSV string*

### 4.3 Search & Query Participants

**Actor**: Any authenticated user

**Queries**:

1. **List all participants**
   ```graphql
   query GetParticipants($raceId: String!) {
     participants(raceId: $raceId) {
       id
       firstName
       lastName
       fullName
       gender
       birthYear
       country
       registrations {
         bib
         wave {
           name
         }
       }
     }
   }
   ```

2. **Search participants**
   ```graphql
   query SearchParticipants($raceId: String!, $query: String!) {
     searchParticipants(raceId: $raceId, query: $query) {
       id
       firstName
       lastName
       fullName
       registrations {
         bib
       }
     }
   }
   ```

3. **Get participant by ID**
   ```graphql
   query GetParticipant($id: String!) {
     participant(id: $id) {
       id
       firstName
       lastName
       fullName
       gender
       birthYear
       country
       registrations {
         id
         bib
         wave {
           name
           scheduledStart
         }
       }
       timingEvents {
         id
         checkpoint {
           name
         }
         timeMs
         elapsedMs
       }
     }
   }
   ```

4. **Find registration by bib**
   ```graphql
   query FindByBib($raceId: String!, $bib: String!) {
     registrationByBib(raceId: $raceId, bib: $bib) {
       id
       bib
       participant {
         id
         firstName
         lastName
       }
       wave {
         name
       }
     }
   }
   ```

---

## 5. Race Day Operations

### 5.1 Timing Session Management

**Actor**: Operator

**Steps**:

1. **Start timing session**
   ```graphql
   mutation StartSession {
     startTimingSession(
       raceId: "race_123"
       deviceId: "RFID_READER_001"
     ) {
       id
       deviceId
       startedAt
       race {
         name
       }
       user {
         email
       }
     }
   }
   ```

2. **Query active sessions**
   ```graphql
   query ActiveSessions($raceId: String!) {
     activeTimingSessions(raceId: $raceId) {
       id
       deviceId
       startedAt
       user {
         email
         profile {
           firstName
           lastName
         }
       }
     }
   }
   ```

3. **Update session metadata**
   ```graphql
   mutation UpdateSession {
     updateTimingSession(
       id: "session_123"
       metadata: "{\"device_type\": \"RFID\", \"firmware\": \"2.1.0\"}"
     ) {
       id
       deviceId
     }
   }
   ```

4. **End timing session**
   ```graphql
   mutation EndSession {
     endTimingSession(id: "session_123") {
       id
       startedAt
       endedAt
     }
   }
   ```

### 5.2 Recording Timing Events

**Actor**: Operator

**Operations**:

1. **Record single timing event**
   ```graphql
   mutation RecordTime {
     recordTimingEvent(
       raceId: "race_123"
       participantId: "participant_123"
       checkpointId: "checkpoint_finish"
       registrationId: "registration_123"
       timingSessionId: "session_123"
       timeMs: 7200000
       deviceTs: "2025-06-15T09:00:00Z"
       source: "RFID_READER_001"
     ) {
       id
       timeMs
       elapsedMs
       sequence
       checkpoint {
         name
       }
       participant {
         firstName
         lastName
       }
     }
   }
   ```

2. **Record bulk timing events** (device buffer upload)
   ```graphql
   mutation RecordBulkTimes {
     recordBulkTimingEvents(
       raceId: "race_123"
       timingSessionId: "session_123"
       events: [
         {
           participantId: "participant_001"
           checkpointId: "checkpoint_5k"
           timeMs: 1200000
           deviceTs: "2025-06-15T07:20:00Z"
           source: "RFID_001"
         }
         {
           participantId: "participant_002"
           checkpointId: "checkpoint_5k"
           timeMs: 1205000
           deviceTs: "2025-06-15T07:20:05Z"
           source: "RFID_001"
         }
         {
           participantId: "participant_003"
           checkpointId: "checkpoint_5k"
           timeMs: 1210000
           deviceTs: "2025-06-15T07:20:10Z"
           source: "RFID_001"
         }
       ]
     ) {
       id
       timeMs
       elapsedMs
       checkpoint {
         name
       }
       participant {
         firstName
         lastName
       }
     }
   }
   ```

### 5.3 Monitoring & Queries

**Actor**: Operator/Viewer

**Queries**:

1. **Get all timing events for race**
   ```graphql
   query GetTimingEvents($raceId: String!) {
     timingEvents(raceId: $raceId) {
       id
       timeMs
       elapsedMs
       sequence
       checkpoint {
         name
         code
       }
       participant {
         firstName
         lastName
       }
       registration {
         bib
       }
       serverTs
       deviceTs
       source
     }
   }
   ```

2. **Get timing events with filters**
   ```graphql
   query FilteredTimingEvents($raceId: String!, $checkpointId: String) {
     timingEvents(
       raceId: $raceId
       checkpointId: $checkpointId
       includeDeleted: false
     ) {
       id
       timeMs
       elapsedMs
       participant {
         firstName
         lastName
       }
       registration {
         bib
       }
     }
   }
   ```

3. **Get participant times (splits)**
   ```graphql
   query ParticipantTimes($raceId: String!, $participantId: String!) {
     participantTimes(raceId: $raceId, participantId: $participantId) {
       id
       timeMs
       elapsedMs
       checkpoint {
         name
         code
         orderIndex
       }
       serverTs
     }
   }
   ```

4. **Get single timing event**
   ```graphql
   query GetTimingEvent($id: String!) {
     timingEvent(id: $id) {
       id
       timeMs
       elapsedMs
       sequence
       deleted
       checkpoint {
         name
         code
       }
       participant {
         firstName
         lastName
       }
       registration {
         bib
       }
       createdBy {
         email
       }
       createdAt
     }
   }
   ```

### 5.4 Timing Event Corrections

**Actor**: Manager/Admin

**Operations**:

1. **Update timing event**
   ```graphql
   mutation UpdateTimingEvent {
     updateTimingEvent(
       id: "event_123"
       timeMs: 7205000
       source: "MANUAL_CORRECTION"
     ) {
       id
       timeMs
       elapsedMs
       checkpoint {
         name
       }
     }
   }
   ```

2. **Delete timing event** (soft delete)
   ```graphql
   mutation DeleteTimingEvent {
     deleteTimingEvent(id: "event_123") {
       id
       deleted
     }
   }
   ```

3. **Undo timing event deletion**
   ```graphql
   mutation UndoDelete {
     undoTimingEventDeletion(id: "event_123") {
       id
       deleted
     }
   }
   ```

4. **Recalculate times for participant**
   ```graphql
   mutation RecalculateTimes {
     recalculateTimes(
       raceId: "race_123"
       participantId: "participant_123"
     )
   }
   ```
   *Returns: Count of updated events*

---

## 6. Results Management

### 6.1 Generate & Refresh Results

**Actor**: Manager/Admin

**Operations**:

1. **Refresh race results** (recalculate all)
   ```graphql
   mutation RefreshResults {
     refreshResults(raceId: "race_123")
   }
   ```
   *Returns: Count of results calculated*

2. **Auto-assign categories to all participants**
   ```graphql
   mutation AssignCategories {
     assignCategoriesToAll(raceId: "race_123")
   }
   ```
   *Returns: Count of assigned participants*

3. **Set category for specific participant**
   ```graphql
   mutation SetCategory {
     setCategoryForParticipant(
       raceId: "race_123"
       participantId: "participant_123"
       category: "M 30-39"
     ) {
       id
       category
       participant {
         firstName
         lastName
       }
     }
   }
   ```

4. **Recalculate category results**
   ```graphql
   mutation RecalculateCategoryResults {
     recalculateCategoryResults(
       raceId: "race_123"
       category: "M 30-39"
     )
   }
   ```
   *Returns: Count of updated results*

### 6.2 Query Results

**Actor**: Any authenticated user

**Queries**:

1. **Get overall leaderboard**
   ```graphql
   query Leaderboard($raceId: String!, $limit: Int) {
     leaderboard(raceId: $raceId, limit: $limit) {
       place
       participant {
         firstName
         lastName
         fullName
         gender
         birthYear
       }
       registration {
         bib
       }
       gunTimeMs
       chipTimeMs
       netTimeMs
       category
     }
   }
   ```

2. **Get results (all)**
   ```graphql
   query GetResults($raceId: String!) {
     results(raceId: $raceId) {
       place
       participant {
         firstName
         lastName
       }
       registration {
         bib
       }
       gunTimeMs
       chipTimeMs
       netTimeMs
       category
       updatedAt
     }
   }
   ```

3. **Get results by category**
   ```graphql
   query CategoryResults($raceId: String!, $category: String!) {
     resultsByCategory(raceId: $raceId, category: $category) {
       place
       participant {
         firstName
         lastName
       }
       registration {
         bib
       }
       chipTimeMs
       category
     }
   }
   ```

4. **Get categories in race**
   ```graphql
   query GetCategories($raceId: String!) {
     categoriesInRace(raceId: $raceId)
   }
   ```
   *Returns: Array of category names*

5. **Get gender-specific results**
   ```graphql
   query GenderResults($raceId: String!, $gender: String!) {
     genderResults(raceId: $raceId, gender: $gender) {
       place
       participant {
         firstName
         lastName
         gender
       }
       registration {
         bib
       }
       chipTimeMs
     }
   }
   ```

6. **Get single participant result**
   ```graphql
   query ParticipantResult($raceId: String!, $participantId: String!) {
     participantResult(raceId: $raceId, participantId: $participantId) {
       place
       gunTimeMs
       chipTimeMs
       netTimeMs
       category
       participant {
         firstName
         lastName
       }
       registration {
         bib
       }
     }
   }
   ```

### 6.3 Export Results

**Actor**: Manager/Admin

**Operation**:

```graphql
query ExportResults {
  exportResults(raceId: "race_123")
}
```
*Returns: CSV string with place, bib, name, category, times*

---

## 7. Post-Race Operations

### 7.1 Manual Time Adjustments

**Actor**: Manager/Admin

**Operations**:

1. **Adjust participant time** (correction)
   ```graphql
   mutation AdjustTime {
     adjustParticipantTime(
       raceId: "race_123"
       participantId: "participant_123"
       adjustmentMs: -5000
       reason: "Timing mat error - corrected based on video evidence"
     ) {
       place
       chipTimeMs
       netTimeMs
       participant {
         firstName
         lastName
       }
     }
   }
   ```

2. **Add time penalty**
   ```graphql
   mutation AddPenalty {
     addTimePenalty(
       raceId: "race_123"
       participantId: "participant_123"
       penaltySeconds: 60
       reason: "Course cutting - missed checkpoint"
     ) {
       place
       chipTimeMs
       participant {
         firstName
         lastName
       }
     }
   }
   ```

### 7.2 Disqualifications

**Actor**: Manager/Admin

**Operations**:

1. **Disqualify participant**
   ```graphql
   mutation DisqualifyParticipant {
     disqualifyParticipant(
       raceId: "race_123"
       participantId: "participant_123"
       reason: "Failed doping test"
     ) {
       category
       place
       participant {
         firstName
         lastName
       }
     }
   }
   ```

2. **Reinstate participant**
   ```graphql
   mutation ReinstateParticipant {
     reinstateParticipant(
       raceId: "race_123"
       participantId: "participant_123"
       category: "M 30-39"
     ) {
       category
       place
       participant {
         firstName
         lastName
       }
     }
   }
   ```

---

## 8. Analytics & Reporting

### 8.1 Race Statistics

**Actor**: Manager/Viewer

**Queries**:

1. **Get overall race statistics**
   ```graphql
   query RaceStats($raceId: String!) {
     raceStatistics(raceId: $raceId) {
       totalParticipants
       totalFinishers
       totalDNF
       totalDQ
       averageTimeSeconds
       fastestTimeSeconds
       slowestTimeSeconds
     }
   }
   ```

2. **Get checkpoint statistics**
   ```graphql
   query CheckpointStats($raceId: String!) {
     checkpointStatistics(raceId: $raceId) {
       checkpointId
       checkpointName
       totalEvents
       averageTimeSeconds
       throughputPerHour
     }
   }
   ```

3. **Get participant splits**
   ```graphql
   query ParticipantSplits($raceId: String!, $participantId: String!) {
     participantSplits(raceId: $raceId, participantId: $participantId) {
       checkpointId
       checkpointName
       timeMs
       elapsedMs
       orderIndex
     }
   }
   ```

4. **Get pace analysis**
   ```graphql
   query PaceAnalysis($raceId: String!) {
     paceAnalysis(raceId: $raceId)
   }
   ```
   *Returns: Array of strings like "0-10 min: 5 finishers"*

---

## 9. Data Management & Auditing

### 9.1 Audit Trail

**Actor**: Manager/Admin

**Queries**:

1. **Get all audit logs for race**
   ```graphql
   query AuditLogs($raceId: String!) {
     auditLogs(raceId: $raceId) {
       id
       entityType
       entityId
       action
       ts
       reason
       user {
         email
         profile {
           firstName
           lastName
         }
       }
       beforeJson
       afterJson
     }
   }
   ```

2. **Get audit logs with filters**
   ```graphql
   query FilteredAuditLogs($raceId: String!, $entityType: String, $action: AuditAction) {
     auditLogs(
       raceId: $raceId
       entityType: $entityType
       action: $action
     ) {
       id
       entityType
       entityId
       action
       ts
       reason
       user {
         email
       }
     }
   }
   ```

3. **Get entity history**
   ```graphql
   query EntityHistory($entityType: String!, $entityId: String!) {
     entityHistory(entityType: $entityType, entityId: $entityId) {
       id
       action
       ts
       reason
       beforeJson
       afterJson
       user {
         email
         profile {
           firstName
           lastName
         }
       }
     }
   }
   ```

4. **Get single audit log**
   ```graphql
   query GetAuditLog($id: String!) {
     auditLog(id: $id) {
       id
       entityType
       entityId
       action
       ts
       reason
       beforeJson
       afterJson
       user {
         email
         profile {
           displayName
         }
       }
     }
   }
   ```

### 9.2 View All Races

**Actor**: Any authenticated user

**Queries**:

1. **List all races for organization**
   ```graphql
   query GetRaces {
     races {
       id
       name
       description
       startDate
       timezone
       raceType
       organization {
         name
       }
       participants {
         id
       }
       checkpoints {
         id
       }
     }
   }
   ```

2. **Get upcoming races**
   ```graphql
   query UpcomingRaces($limit: Int) {
     upcomingRaces(limit: $limit) {
       id
       name
       startDate
       raceType
       organization {
         name
       }
     }
   }
   ```

---

## Common Workflow Examples

### Example 1: Complete Race Setup Workflow

1. Create Race → 2. Create Checkpoints (START, 5K, 10K, FINISH) → 3. Create Waves (A, B, C) → 4. Import Participants from CSV → 5. Verify registrations

### Example 2: Race Day Workflow

1. Start Timing Session → 2. Record timing events as they happen (bulk uploads every 30 seconds) → 3. Monitor participant times in real-time → 4. End Timing Session → 5. Refresh Results → 6. Generate Leaderboard

### Example 3: Post-Race Results Management

1. Review results → 2. Apply manual adjustments if needed → 3. Assign categories to all → 4. Recalculate category results → 5. Handle DQs if needed → 6. Export final results to CSV → 7. Review audit trail

---

## GraphQL Best Practices

### Pagination
While not fully implemented in P0-P3, queries can be extended with pagination using:
- `limit` parameter (already supported in some queries)
- `offset` parameter (future enhancement)
- Cursor-based pagination (future enhancement)

### Error Handling
All mutations will throw GraphQL errors with descriptive messages:
- "Not authorized" - User lacks permission
- "Not found" - Entity doesn't exist
- "Already exists" - Duplicate entry
- "Invalid input" - Validation failed

### Authentication
All queries and mutations (except `login`) require authentication via JWT cookie. Include the cookie in your requests after logging in.

---

## Summary

This document covers **all major user flows** in the Race Times API, from initial setup through race day operations to post-race management and analytics. Each flow includes the specific GraphQL operations needed to complete the workflow.

For technical details about the schema and objects, see [FEATURES.md](./FEATURES.md).
