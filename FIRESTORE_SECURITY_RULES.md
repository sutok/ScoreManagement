# Firestore Security Rules Documentation

## Overview
This document describes the security rules for the facility and tournament management system.

## Role-Based Access Control

### User Roles
- **user**: General users (default)
- **facility_manager**: Facility managers who can manage facilities and tournaments
- **admin**: System administrators with full access

## Helper Functions

### `isAdmin()`
Checks if the current user has admin role.

```javascript
function isAdmin() {
  return request.auth != null &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### `isFacilityManager()`
Checks if the current user has facility_manager role.

```javascript
function isFacilityManager() {
  return request.auth != null &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'facility_manager';
}
```

### `isFacilityMember(facilityId)`
Checks if the current user is a member of the specified facility.

```javascript
function isFacilityMember(facilityId) {
  return request.auth != null &&
         exists(/databases/$(database)/documents/facilityMembers/$(request.auth.uid + '_' + facilityId));
}
```

## Collection Rules

### Companies (`/companies/{companyId}`)
**Purpose**: Store company/organization information

| Operation | Access Control |
|-----------|----------------|
| Read | All authenticated users |
| Write (create/update/delete) | Admin only |

### Facilities (`/facilities/{facilityId}`)
**Purpose**: Store bowling facility information

| Operation | Access Control |
|-----------|----------------|
| Read | All authenticated users |
| Create | Admin or facility_manager |
| Update/Delete | Admin or facility members |

### Facility Members (`/facilityMembers/{memberId}`)
**Purpose**: Manage user-facility relationships (many-to-many)

**Document ID Format**: `{userId}_{facilityId}`

| Operation | Access Control |
|-----------|----------------|
| Read | All authenticated users |
| Write (create/update/delete) | Admin only |

### Recurring Tournaments (`/recurringTournaments/{recurringId}`)
**Purpose**: Store recurring tournament templates (e.g., "毎月第3水曜")

| Operation | Access Control |
|-----------|----------------|
| Read | All authenticated users |
| Create | Admin or facility_manager |
| Update/Delete | Admin or facility members of the tournament's facility |

### Tournaments (`/tournaments/{tournamentId}`)
**Purpose**: Store actual tournament events

| Operation | Access Control |
|-----------|----------------|
| Read | All authenticated users |
| Create | Admin or facility_manager |
| Update/Delete | Admin or facility members of the tournament's facility |

#### Tournament Results (`/tournaments/{tournamentId}/results/{resultId}`)
**Purpose**: Store tournament results (subcollection)

| Operation | Access Control |
|-----------|----------------|
| Read | All authenticated users |
| Write (create/update/delete) | Admin or facility members of the tournament's facility |

## Security Best Practices

### 1. Authentication Required
All operations require user authentication (`request.auth != null`).

### 2. Principle of Least Privilege
- General users can only read facility and tournament information
- Facility managers can create facilities and tournaments
- Only facility members can modify their own facility's data
- Only admins can manage company and facility membership data

### 3. Data Validation
Client-side validation should be implemented to ensure data integrity before submission.

### 4. Facility Membership Verification
Before allowing write operations on facilities or tournaments, the system verifies:
1. User is admin (full access), OR
2. User is a member of the facility (via FacilityMembers collection)

## Testing Rules

### Using Firebase Emulator
```bash
# Start Firestore emulator
firebase emulators:start --only firestore

# Rules are automatically loaded from firestore.rules
```

### Manual Testing Scenarios

#### Test 1: General User Access
- ✅ Can read facilities
- ✅ Can read tournaments
- ❌ Cannot create/update/delete facilities
- ❌ Cannot create/update/delete tournaments

#### Test 2: Facility Manager Access
- ✅ Can create facilities
- ✅ Can create tournaments
- ✅ Can update/delete own facility's data (if member)
- ❌ Cannot modify other facilities' data
- ❌ Cannot manage facility memberships

#### Test 3: Admin Access
- ✅ Full access to all collections
- ✅ Can manage companies
- ✅ Can manage facility memberships
- ✅ Can modify any facility or tournament

## Deployment

Deploy rules to production:
```bash
firebase deploy --only firestore:rules
```

Deploy to specific project:
```bash
firebase deploy --only firestore:rules --project production
```

## Future Enhancements

1. **Rate Limiting**: Add rate limiting rules to prevent abuse
2. **Field-Level Validation**: Add validation for specific fields (e.g., entryFee >= 0)
3. **Audit Logging**: Consider adding read audit for sensitive operations
4. **Cascade Delete**: Add rules to handle cascading deletes properly
