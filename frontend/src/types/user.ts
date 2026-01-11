export interface User {
  id: string;
  displayName: string;
  email: string | null;
  profileImageUrl: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
