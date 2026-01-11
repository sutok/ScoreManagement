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
import { type Game, type Frame } from '../types/game';

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
 * Create a new game with frames
 */
export const createGame = async (
  userId: string,
  frames: Frame[],
  memo?: string
): Promise<string> => {
  try {
    const gamesRef = collection(db, 'games');

    // Calculate total score from last frame's cumulative score
    const totalScore = frames[9].cumulativeScore;

    const gameData = {
      userId,
      playedAt: Timestamp.now(),
      totalScore,
      gameNumber: 1, // Will be calculated based on user's game count
      memo: memo || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const gameDoc = await addDoc(gamesRef, gameData);

    // Add frames as subcollection
    const framesRef = collection(db, 'games', gameDoc.id, 'frames');
    const framePromises = frames.map((frame) =>
      addDoc(framesRef, {
        frameNumber: frame.frameNumber,
        firstThrow: frame.firstThrow,
        secondThrow: frame.secondThrow,
        thirdThrow: frame.thirdThrow,
        frameScore: frame.frameScore,
        cumulativeScore: frame.cumulativeScore,
        isStrike: frame.isStrike,
        isSpare: frame.isSpare,
        createdAt: Timestamp.now(),
      })
    );

    await Promise.all(framePromises);

    return gameDoc.id;
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
};

/**
 * Get all games for a user
 */
export const getGames = async (userId: string): Promise<Game[]> => {
  try {
    const gamesRef = collection(db, 'games');
    const q = query(
      gamesRef,
      where('userId', '==', userId),
      orderBy('playedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const games = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        playedAt: timestampToDate(data.playedAt),
        totalScore: data.totalScore,
        gameNumber: data.gameNumber,
        memo: data.memo,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as Game;
    });

    return games;
  } catch (error) {
    console.error('Error getting games:', error);
    throw error;
  }
};

/**
 * Get a single game by ID
 */
export const getGame = async (gameId: string): Promise<Game | null> => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);

    if (!gameSnap.exists()) {
      return null;
    }

    const data = gameSnap.data();
    return {
      id: gameSnap.id,
      userId: data.userId,
      playedAt: timestampToDate(data.playedAt),
      totalScore: data.totalScore,
      gameNumber: data.gameNumber,
      memo: data.memo,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as Game;
  } catch (error) {
    console.error('Error getting game:', error);
    throw error;
  }
};

/**
 * Get frames for a game
 */
export const getFrames = async (gameId: string): Promise<Frame[]> => {
  try {
    const framesRef = collection(db, 'games', gameId, 'frames');
    const q = query(framesRef, orderBy('frameNumber', 'asc'));
    const snapshot = await getDocs(q);

    const frames = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        frameNumber: data.frameNumber,
        firstThrow: data.firstThrow,
        secondThrow: data.secondThrow,
        thirdThrow: data.thirdThrow,
        frameScore: data.frameScore,
        cumulativeScore: data.cumulativeScore,
        isStrike: data.isStrike,
        isSpare: data.isSpare,
      } as Frame;
    });

    return frames;
  } catch (error) {
    console.error('Error getting frames:', error);
    throw error;
  }
};

/**
 * Update a game
 */
export const updateGame = async (
  gameId: string,
  updates: Partial<Game>
): Promise<void> => {
  try {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating game:', error);
    throw error;
  }
};

/**
 * Delete a game and its frames
 */
export const deleteGame = async (gameId: string): Promise<void> => {
  try {
    // Delete all frames first
    const framesRef = collection(db, 'games', gameId, 'frames');
    const framesSnapshot = await getDocs(framesRef);
    const deleteFramePromises = framesSnapshot.docs.map((frameDoc) =>
      deleteDoc(frameDoc.ref)
    );
    await Promise.all(deleteFramePromises);

    // Delete the game
    const gameRef = doc(db, 'games', gameId);
    await deleteDoc(gameRef);
  } catch (error) {
    console.error('Error deleting game:', error);
    throw error;
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (userId: string) => {
  try {
    const games = await getGames(userId);

    if (games.length === 0) {
      return {
        totalGames: 0,
        averageScore: 0,
        highScore: 0,
        lowScore: 0,
      };
    }

    const scores = games.map((g) => g.totalScore);
    const totalGames = games.length;
    const averageScore = Math.round(
      scores.reduce((sum, score) => sum + score, 0) / totalGames
    );
    const highScore = Math.max(...scores);
    const lowScore = Math.min(...scores);

    return {
      totalGames,
      averageScore,
      highScore,
      lowScore,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};
