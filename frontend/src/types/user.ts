export type UserRole = 'user' | 'facility_manager' | 'admin';

/**
 * User role document stored in Firestore /roles/{userId}
 * Only users with special privileges have a document in this collection
 */
export interface UserRoleDocument {
  role: 'admin' | 'facility_manager';
  facilities?: string[]; // Array of facility IDs that facility_manager can manage
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  displayName: string;
  email: string | null;
  profileImageUrl: string | null;
  role: UserRole; // Computed from roles collection, defaults to 'user'
  facilities?: string[]; // Available if role is 'facility_manager'
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Firebase Auth compatibility properties
  uid: string; // Alias for id
  photoURL: string | null; // Alias for profileImageUrl
}
