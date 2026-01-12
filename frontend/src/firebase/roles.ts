import { doc, getDoc } from 'firebase/firestore';
import { db } from './config';
import { type UserRoleDocument } from '../types/user';

/**
 * Convert Firestore timestamp to Date
 */
const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
};

/**
 * Get user role document from Firestore
 * Returns null if user has no special privileges (default to 'user' role)
 */
export const getUserRole = async (userId: string): Promise<UserRoleDocument | null> => {
  try {
    const roleRef = doc(db, 'roles', userId);
    const roleSnap = await getDoc(roleRef);

    if (!roleSnap.exists()) {
      return null; // User has default 'user' role
    }

    const data = roleSnap.data();
    return {
      role: data.role,
      facilities: data.facilities || undefined,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as UserRoleDocument;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null; // On error, default to 'user' role
  }
};

/**
 * Check if user is admin
 */
export const isAdmin = async (userId: string): Promise<boolean> => {
  const roleDoc = await getUserRole(userId);
  return roleDoc?.role === 'admin';
};

/**
 * Check if user is facility manager
 */
export const isFacilityManager = async (userId: string): Promise<boolean> => {
  const roleDoc = await getUserRole(userId);
  return roleDoc?.role === 'facility_manager';
};

/**
 * Check if user can manage a specific facility
 */
export const canManageFacility = async (
  userId: string,
  facilityId: string
): Promise<boolean> => {
  const roleDoc = await getUserRole(userId);

  if (!roleDoc) {
    return false; // Regular users cannot manage facilities
  }

  if (roleDoc.role === 'admin') {
    return true; // Admins can manage all facilities
  }

  if (roleDoc.role === 'facility_manager') {
    return roleDoc.facilities?.includes(facilityId) ?? false;
  }

  return false;
};

/**
 * Get list of facilities that user can manage
 * Returns empty array for regular users, all facility IDs for admins
 */
export const getManagedFacilities = async (userId: string): Promise<string[] | 'all'> => {
  const roleDoc = await getUserRole(userId);

  if (!roleDoc) {
    return []; // Regular users manage no facilities
  }

  if (roleDoc.role === 'admin') {
    return 'all'; // Admins manage all facilities
  }

  if (roleDoc.role === 'facility_manager') {
    return roleDoc.facilities ?? [];
  }

  return [];
};
