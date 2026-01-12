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
import {
  type RecurringTournament,
  type Tournament,
} from '../types/facility';

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

// ===== Recurring Tournament Operations =====

/**
 * Create a new recurring tournament template
 */
export const createRecurringTournament = async (
  tournamentData: Omit<RecurringTournament, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const tournamentsRef = collection(db, 'recurringTournaments');
    const tournamentDoc = await addDoc(tournamentsRef, {
      ...tournamentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return tournamentDoc.id;
  } catch (error) {
    console.error('Error creating recurring tournament:', error);
    throw error;
  }
};

/**
 * Get all recurring tournaments
 */
export const getRecurringTournaments = async (): Promise<RecurringTournament[]> => {
  try {
    const tournamentsRef = collection(db, 'recurringTournaments');
    const q = query(tournamentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        facilityId: data.facilityId,
        title: data.title,
        description: data.description,
        pattern: data.pattern,
        entryFee: data.entryFee,
        level: data.level,
        isActive: data.isActive,
        createdBy: data.createdBy,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as RecurringTournament;
    });
  } catch (error) {
    console.error('Error getting recurring tournaments:', error);
    throw error;
  }
};

/**
 * Get recurring tournaments by facility
 */
export const getRecurringTournamentsByFacility = async (
  facilityId: string
): Promise<RecurringTournament[]> => {
  try {
    const tournamentsRef = collection(db, 'recurringTournaments');
    const q = query(
      tournamentsRef,
      where('facilityId', '==', facilityId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        facilityId: data.facilityId,
        title: data.title,
        description: data.description,
        pattern: data.pattern,
        entryFee: data.entryFee,
        level: data.level,
        isActive: data.isActive,
        createdBy: data.createdBy,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as RecurringTournament;
    });
  } catch (error) {
    console.error('Error getting recurring tournaments by facility:', error);
    throw error;
  }
};

/**
 * Get a single recurring tournament by ID
 */
export const getRecurringTournament = async (
  tournamentId: string
): Promise<RecurringTournament | null> => {
  try {
    const tournamentRef = doc(db, 'recurringTournaments', tournamentId);
    const tournamentSnap = await getDoc(tournamentRef);

    if (!tournamentSnap.exists()) {
      return null;
    }

    const data = tournamentSnap.data();
    return {
      id: tournamentSnap.id,
      facilityId: data.facilityId,
      title: data.title,
      description: data.description,
      pattern: data.pattern,
      entryFee: data.entryFee,
      level: data.level,
      isActive: data.isActive,
      createdBy: data.createdBy,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as RecurringTournament;
  } catch (error) {
    console.error('Error getting recurring tournament:', error);
    throw error;
  }
};

/**
 * Update a recurring tournament
 */
export const updateRecurringTournament = async (
  tournamentId: string,
  updates: Partial<Omit<RecurringTournament, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const tournamentRef = doc(db, 'recurringTournaments', tournamentId);
    await updateDoc(tournamentRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating recurring tournament:', error);
    throw error;
  }
};

/**
 * Delete a recurring tournament
 */
export const deleteRecurringTournament = async (tournamentId: string): Promise<void> => {
  try {
    const tournamentRef = doc(db, 'recurringTournaments', tournamentId);
    await deleteDoc(tournamentRef);
  } catch (error) {
    console.error('Error deleting recurring tournament:', error);
    throw error;
  }
};

// ===== Tournament Operations =====

/**
 * Create a new tournament event
 */
export const createTournament = async (
  tournamentData: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const tournamentsRef = collection(db, 'tournaments');
    const tournamentDoc = await addDoc(tournamentsRef, {
      ...tournamentData,
      eventDate: Timestamp.fromDate(tournamentData.eventDate),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return tournamentDoc.id;
  } catch (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
};

/**
 * Get all tournaments
 */
export const getTournaments = async (): Promise<Tournament[]> => {
  try {
    const tournamentsRef = collection(db, 'tournaments');
    const q = query(tournamentsRef, orderBy('eventDate', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        facilityId: data.facilityId,
        recurringId: data.recurringId || null,
        title: data.title,
        description: data.description,
        eventDate: timestampToDate(data.eventDate),
        entryFee: data.entryFee,
        level: data.level,
        status: data.status,
        createdBy: data.createdBy,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as Tournament;
    });
  } catch (error) {
    console.error('Error getting tournaments:', error);
    throw error;
  }
};

/**
 * Get tournaments by facility
 */
export const getTournamentsByFacility = async (
  facilityId: string
): Promise<Tournament[]> => {
  try {
    const tournamentsRef = collection(db, 'tournaments');
    const q = query(
      tournamentsRef,
      where('facilityId', '==', facilityId),
      orderBy('eventDate', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        facilityId: data.facilityId,
        recurringId: data.recurringId || null,
        title: data.title,
        description: data.description,
        eventDate: timestampToDate(data.eventDate),
        entryFee: data.entryFee,
        level: data.level,
        status: data.status,
        createdBy: data.createdBy,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as Tournament;
    });
  } catch (error) {
    console.error('Error getting tournaments by facility:', error);
    throw error;
  }
};

/**
 * Update a tournament
 */
export const updateTournament = async (
  tournamentId: string,
  updates: Partial<Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Convert eventDate if present
    if (updates.eventDate) {
      updateData.eventDate = Timestamp.fromDate(updates.eventDate);
    }

    await updateDoc(tournamentRef, updateData);
  } catch (error) {
    console.error('Error updating tournament:', error);
    throw error;
  }
};

/**
 * Delete a tournament
 */
export const deleteTournament = async (tournamentId: string): Promise<void> => {
  try {
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    await deleteDoc(tournamentRef);
  } catch (error) {
    console.error('Error deleting tournament:', error);
    throw error;
  }
};
