export type UserRole = 'user' | 'facility_manager' | 'admin';

export interface User {
  id: string;
  displayName: string;
  email: string | null;
  profileImageUrl: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
