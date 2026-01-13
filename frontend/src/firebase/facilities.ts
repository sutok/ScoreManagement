import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { type Facility, type Company, type FacilityMember } from '../types/facility';

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

// ===== Company Operations =====

/**
 * Create a new company
 */
export const createCompany = async (
  name: string,
  email: string
): Promise<string> => {
  try {
    const companiesRef = collection(db, 'companies');
    const companyDoc = await addDoc(companiesRef, {
      name,
      email,
      createdAt: Timestamp.now(),
    });
    return companyDoc.id;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

/**
 * Get all companies
 */
export const getCompanies = async (): Promise<Company[]> => {
  try {
    const companiesRef = collection(db, 'companies');
    const snapshot = await getDocs(companiesRef);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        createdAt: timestampToDate(data.createdAt),
      } as Company;
    });
  } catch (error) {
    console.error('Error getting companies:', error);
    throw error;
  }
};

// ===== Facility Operations =====

/**
 * Create a new facility
 */
export const createFacility = async (
  facilityData: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const facilitiesRef = collection(db, 'facilities');

    // Remove undefined fields (Firestore doesn't support undefined)
    const cleanData: any = {
      name: facilityData.name,
      address: facilityData.address,
      prefecture: facilityData.prefecture,
      city: facilityData.city,
      phoneNumber: facilityData.phoneNumber,
      businessHours: facilityData.businessHours,
      numberOfLanes: facilityData.numberOfLanes,
      companyId: facilityData.companyId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Only add optional fields if they have values
    if (facilityData.branchName) {
      cleanData.branchName = facilityData.branchName;
    }
    if (facilityData.createdBy) {
      cleanData.createdBy = facilityData.createdBy;
    }
    if (facilityData.approved) {
      cleanData.approved = Timestamp.fromDate(facilityData.approved);
    }

    const facilityDoc = await addDoc(facilitiesRef, cleanData);
    return facilityDoc.id;
  } catch (error) {
    console.error('Error creating facility:', error);
    throw error;
  }
};

/**
 * Get all facilities (approved only - Firestore rules enforce this for non-admin users)
 */
export const getFacilities = async (): Promise<Facility[]> => {
  try {
    const facilitiesRef = collection(db, 'facilities');
    const q = query(facilitiesRef, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        branchName: data.branchName,
        address: data.address,
        prefecture: data.prefecture,
        city: data.city,
        phoneNumber: data.phoneNumber,
        businessHours: data.businessHours,
        numberOfLanes: data.numberOfLanes,
        companyId: data.companyId,
        approved: data.approved ? timestampToDate(data.approved) : undefined,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as Facility;
    });
  } catch (error) {
    console.error('Error getting facilities:', error);
    throw error;
  }
};

/**
 * Get facilities by prefecture
 */
export const getFacilitiesByPrefecture = async (
  prefecture: string
): Promise<Facility[]> => {
  try {
    const facilitiesRef = collection(db, 'facilities');
    const q = query(
      facilitiesRef,
      where('prefecture', '==', prefecture),
      orderBy('name', 'asc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        branchName: data.branchName,
        address: data.address,
        prefecture: data.prefecture,
        city: data.city,
        phoneNumber: data.phoneNumber,
        businessHours: data.businessHours,
        numberOfLanes: data.numberOfLanes,
        companyId: data.companyId,
        approved: data.approved ? timestampToDate(data.approved) : undefined,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as Facility;
    });
  } catch (error) {
    console.error('Error getting facilities by prefecture:', error);
    throw error;
  }
};

/**
 * Get a single facility by ID
 */
export const getFacility = async (facilityId: string): Promise<Facility | null> => {
  try {
    const facilityRef = doc(db, 'facilities', facilityId);
    const facilitySnap = await getDoc(facilityRef);

    if (!facilitySnap.exists()) {
      return null;
    }

    const data = facilitySnap.data();
    return {
      id: facilitySnap.id,
      name: data.name,
      branchName: data.branchName,
      address: data.address,
      prefecture: data.prefecture,
      city: data.city,
      phoneNumber: data.phoneNumber,
      businessHours: data.businessHours,
      numberOfLanes: data.numberOfLanes,
      companyId: data.companyId,
      approved: data.approved ? timestampToDate(data.approved) : undefined,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as Facility;
  } catch (error) {
    console.error('Error getting facility:', error);
    throw error;
  }
};

/**
 * Update a facility
 */
export const updateFacility = async (
  facilityId: string,
  updates: Partial<Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const facilityRef = doc(db, 'facilities', facilityId);
    await updateDoc(facilityRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating facility:', error);
    throw error;
  }
};

/**
 * Delete a facility
 */
export const deleteFacility = async (facilityId: string): Promise<void> => {
  try {
    const facilityRef = doc(db, 'facilities', facilityId);
    await deleteDoc(facilityRef);
  } catch (error) {
    console.error('Error deleting facility:', error);
    throw error;
  }
};

// ===== Facility Member Operations =====

/**
 * Add a user as a facility member
 */
export const addFacilityMember = async (
  userId: string,
  facilityId: string,
  companyId: string,
  role: 'owner' | 'manager' | 'staff',
  contractType: string
): Promise<string> => {
  try {
    const membersRef = collection(db, 'facilityMembers');
    const memberDoc = await addDoc(membersRef, {
      userId,
      facilityId,
      companyId,
      role,
      contractType,
      createdAt: Timestamp.now(),
    });
    return memberDoc.id;
  } catch (error) {
    console.error('Error adding facility member:', error);
    throw error;
  }
};

/**
 * Get facility members
 */
export const getFacilityMembers = async (
  facilityId: string
): Promise<FacilityMember[]> => {
  try {
    const membersRef = collection(db, 'facilityMembers');
    const q = query(membersRef, where('facilityId', '==', facilityId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        facilityId: data.facilityId,
        companyId: data.companyId,
        role: data.role,
        contractType: data.contractType,
        createdAt: timestampToDate(data.createdAt),
      } as FacilityMember;
    });
  } catch (error) {
    console.error('Error getting facility members:', error);
    throw error;
  }
};

/**
 * Get facilities for a user
 */
export const getUserFacilities = async (userId: string): Promise<Facility[]> => {
  try {
    // Get facility memberships for user
    const membersRef = collection(db, 'facilityMembers');
    const q = query(membersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const facilityIds = snapshot.docs.map((doc) => doc.data().facilityId);

    if (facilityIds.length === 0) {
      return [];
    }

    // Get facilities
    const facilities: Facility[] = [];
    for (const facilityId of facilityIds) {
      const facility = await getFacility(facilityId);
      if (facility) {
        facilities.push(facility);
      }
    }

    return facilities;
  } catch (error) {
    console.error('Error getting user facilities:', error);
    throw error;
  }
};

/**
 * Remove a facility member
 */
export const removeFacilityMember = async (memberId: string): Promise<void> => {
  try {
    const memberRef = doc(db, 'facilityMembers', memberId);
    await deleteDoc(memberRef);
  } catch (error) {
    console.error('Error removing facility member:', error);
    throw error;
  }
};

// ===== Facility Application Operations =====

/**
 * Check if facility name + branchName combination already exists in the same company
 * @param companyId - Company ID to check within
 * @param name - Facility name
 * @param branchName - Branch name (optional)
 * @param excludeFacilityId - Facility ID to exclude from check (for editing)
 * @returns true if duplicate exists, false otherwise
 */
export const checkFacilityDuplicate = async (
  companyId: string,
  name: string,
  branchName: string | undefined,
  excludeFacilityId?: string
): Promise<boolean> => {
  try {
    const facilitiesRef = collection(db, 'facilities');

    // Query by companyId and name (compound index required)
    const q = query(
      facilitiesRef,
      where('companyId', '==', companyId),
      where('name', '==', name)
    );

    const snapshot = await getDocs(q);

    // Check if any document has matching branchName
    const duplicates = snapshot.docs.filter((doc) => {
      const data = doc.data();

      // Exclude self when editing
      if (excludeFacilityId && doc.id === excludeFacilityId) {
        return false;
      }

      // Match branchName (both undefined or same value)
      const isBranchMatch =
        (data.branchName === undefined && branchName === undefined) ||
        (data.branchName === '' && branchName === undefined) ||
        (data.branchName === undefined && branchName === '') ||
        (data.branchName === branchName);

      return isBranchMatch;
    });

    return duplicates.length > 0;
  } catch (error) {
    console.error('Error checking facility duplicate:', error);
    throw error;
  }
};

/**
 * Apply for a new facility (creates facility with approved=null)
 */
export const applyFacility = async (
  facilityData: Omit<Facility, 'id' | 'approved' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<string> => {
  try {
    const facilitiesRef = collection(db, 'facilities');

    // Remove undefined fields (Firestore doesn't support undefined)
    const cleanData: any = {
      name: facilityData.name,
      address: facilityData.address,
      prefecture: facilityData.prefecture,
      city: facilityData.city,
      phoneNumber: facilityData.phoneNumber,
      businessHours: facilityData.businessHours,
      numberOfLanes: facilityData.numberOfLanes,
      companyId: facilityData.companyId,
      createdBy: userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Only add optional fields if they have values
    if (facilityData.branchName) {
      cleanData.branchName = facilityData.branchName;
    }

    const facilityDoc = await addDoc(facilitiesRef, cleanData);
    return facilityDoc.id;
  } catch (error) {
    console.error('Error applying for facility:', error);
    throw error;
  }
};

/**
 * Get pending facilities (unapproved only - admin only)
 */
export const getPendingFacilities = async (): Promise<Facility[]> => {
  try {
    const facilitiesRef = collection(db, 'facilities');
    const q = query(facilitiesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    // Filter for unapproved facilities (approved field doesn't exist or is null)
    // Note: Firestore rules ensure only admins can see these
    return snapshot.docs
      .filter((doc) => {
        const data = doc.data();
        return !data.approved;
      })
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          branchName: data.branchName,
          address: data.address,
          prefecture: data.prefecture,
          city: data.city,
          phoneNumber: data.phoneNumber,
          businessHours: data.businessHours,
          numberOfLanes: data.numberOfLanes,
          companyId: data.companyId,
          createdBy: data.createdBy, // Include applicant userId
          approved: data.approved ? timestampToDate(data.approved) : undefined,
          createdAt: timestampToDate(data.createdAt),
          updatedAt: timestampToDate(data.updatedAt),
        } as Facility;
      });
  } catch (error) {
    console.error('Error getting pending facilities:', error);
    throw error;
  }
};

/**
 * Approve a facility application (admin only)
 * - Sets approved timestamp
 * - Updates applicant's role to facility_manager if they are 'user'
 * - Adds facility to applicant's managed facilities
 */
export const approveFacility = async (
  facilityId: string,
  applicantUserId: string
): Promise<void> => {
  try {
    // Update facility: set approved timestamp
    const facilityRef = doc(db, 'facilities', facilityId);
    await updateDoc(facilityRef, {
      approved: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Update user role: import is needed
    // This function will be imported from roles.ts
    // For now, we'll do it directly
    const roleRef = doc(db, 'roles', applicantUserId);
    const roleSnap = await getDoc(roleRef);

    if (roleSnap.exists()) {
      const roleData = roleSnap.data();

      // Update role to facility_manager if currently 'user'
      if (roleData.role === 'user') {
        await updateDoc(roleRef, {
          role: 'facility_manager',
          facilities: [facilityId],
          updatedAt: Timestamp.now(),
        });
      } else if (roleData.role === 'facility_manager') {
        // If already facility_manager, just add to facilities array
        const currentFacilities = roleData.facilities || [];
        if (!currentFacilities.includes(facilityId)) {
          await updateDoc(roleRef, {
            facilities: [...currentFacilities, facilityId],
            updatedAt: Timestamp.now(),
          });
        }
      }
    } else {
      // Create role document if it doesn't exist
      await updateDoc(roleRef, {
        role: 'facility_manager',
        facilities: [facilityId],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error approving facility:', error);
    throw error;
  }
};
