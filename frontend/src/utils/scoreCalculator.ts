import { type Frame } from '../types/game';

/**
 * Initialize empty frames for a new game
 */
export const initializeFrames = (): Frame[] => {
  return Array.from({ length: 10 }, (_, i) => ({
    frameNumber: i + 1,
    firstThrow: null,
    secondThrow: null,
    thirdThrow: null,
    frameScore: 0,
    cumulativeScore: 0,
    isStrike: false,
    isSpare: false,
  }));
};

/**
 * Calculate if a frame is a strike
 */
export const isStrike = (firstThrow: number | null): boolean => {
  return firstThrow === 10;
};

/**
 * Calculate if a frame is a spare
 */
export const isSpare = (firstThrow: number | null, secondThrow: number | null): boolean => {
  if (firstThrow === null || secondThrow === null) return false;
  return firstThrow + secondThrow === 10;
};

/**
 * Calculate frame score (without bonuses)
 */
export const calculateFrameScore = (frame: Frame): number => {
  const { firstThrow, secondThrow, thirdThrow } = frame;

  let score = 0;
  if (firstThrow !== null) score += firstThrow;
  if (secondThrow !== null) score += secondThrow;
  if (thirdThrow !== null) score += thirdThrow;

  return score;
};

/**
 * Get the next throw value for bonus calculation
 */
const getThrowValue = (frames: Frame[], frameIndex: number, throwIndex: number): number => {
  if (frameIndex >= frames.length) return 0;

  const frame = frames[frameIndex];

  if (throwIndex === 0) return frame.firstThrow ?? 0;
  if (throwIndex === 1) return frame.secondThrow ?? 0;
  if (throwIndex === 2) return frame.thirdThrow ?? 0;

  return 0;
};

/**
 * Calculate total score with bonuses for strikes and spares
 */
export const calculateTotalScore = (frames: Frame[]): Frame[] => {
  const updatedFrames = [...frames];
  let cumulativeScore = 0;

  for (let i = 0; i < updatedFrames.length; i++) {
    const frame = updatedFrames[i];
    let frameScore = 0;

    // Frame 10 (index 9) - special scoring
    if (i === 9) {
      frameScore = calculateFrameScore(frame);
      frame.isStrike = frame.firstThrow === 10;
      frame.isSpare = !frame.isStrike &&
                      frame.firstThrow !== null &&
                      frame.secondThrow !== null &&
                      frame.firstThrow + frame.secondThrow === 10;
    }
    // Frames 1-9 - standard scoring with bonuses
    else {
      const firstThrow = frame.firstThrow ?? 0;
      const secondThrow = frame.secondThrow ?? 0;

      // Strike bonus: 10 + next 2 throws
      if (isStrike(frame.firstThrow)) {
        frame.isStrike = true;
        frame.isSpare = false;

        const nextThrow1 = getThrowValue(frames, i + 1, 0);
        const nextThrow2 = i + 1 === 9
          ? getThrowValue(frames, i + 1, 1) // Frame 10 second throw
          : getThrowValue(frames, i + 1, 0) === 10
            ? getThrowValue(frames, i + 2, 0) // Next frame is also strike
            : getThrowValue(frames, i + 1, 1); // Next frame second throw

        frameScore = 10 + nextThrow1 + nextThrow2;
      }
      // Spare bonus: 10 + next 1 throw
      else if (isSpare(frame.firstThrow, frame.secondThrow)) {
        frame.isStrike = false;
        frame.isSpare = true;

        const nextThrow = getThrowValue(frames, i + 1, 0);
        frameScore = 10 + nextThrow;
      }
      // Open frame: no bonus
      else {
        frame.isStrike = false;
        frame.isSpare = false;
        frameScore = firstThrow + secondThrow;
      }
    }

    frame.frameScore = frameScore;
    cumulativeScore += frameScore;
    frame.cumulativeScore = cumulativeScore;
  }

  return updatedFrames;
};

/**
 * Validate a throw value
 */
export const isValidThrow = (value: number, max: number = 10): boolean => {
  return value >= 0 && value <= max && Number.isInteger(value);
};

/**
 * Validate a frame's throws
 */
export const validateFrame = (
  frameNumber: number,
  firstThrow: number | null,
  secondThrow: number | null,
  thirdThrow: number | null
): { valid: boolean; error?: string } => {
  // Frame 10 special validation
  if (frameNumber === 10) {
    if (firstThrow === null) {
      return { valid: false, error: '1投目を入力してください' };
    }

    if (!isValidThrow(firstThrow)) {
      return { valid: false, error: '1投目は0-10の整数で入力してください' };
    }

    // Strike in first throw
    if (firstThrow === 10) {
      if (secondThrow === null) {
        return { valid: false, error: '2投目を入力してください' };
      }
      if (!isValidThrow(secondThrow)) {
        return { valid: false, error: '2投目は0-10の整数で入力してください' };
      }

      // Strike in second throw
      if (secondThrow === 10) {
        if (thirdThrow === null) {
          return { valid: false, error: '3投目を入力してください' };
        }
        if (!isValidThrow(thirdThrow)) {
          return { valid: false, error: '3投目は0-10の整数で入力してください' };
        }
      }
      // No strike in second throw
      else {
        if (thirdThrow === null) {
          return { valid: false, error: '3投目を入力してください' };
        }
        if (!isValidThrow(thirdThrow, 10 - secondThrow)) {
          return { valid: false, error: `3投目は0-${10 - secondThrow}で入力してください` };
        }
      }
    }
    // No strike in first throw
    else {
      if (secondThrow === null) {
        return { valid: false, error: '2投目を入力してください' };
      }
      if (!isValidThrow(secondThrow, 10 - firstThrow)) {
        return { valid: false, error: `2投目は0-${10 - firstThrow}で入力してください` };
      }

      // Spare in frame 10
      if (firstThrow + secondThrow === 10) {
        if (thirdThrow === null) {
          return { valid: false, error: '3投目を入力してください' };
        }
        if (!isValidThrow(thirdThrow)) {
          return { valid: false, error: '3投目は0-10の整数で入力してください' };
        }
      }
      // No third throw needed
      else {
        if (thirdThrow !== null) {
          return { valid: false, error: 'スペアでもストライクでもない場合、3投目は入力できません' };
        }
      }
    }

    return { valid: true };
  }

  // Frames 1-9 validation
  if (firstThrow === null) {
    return { valid: false, error: '1投目を入力してください' };
  }

  if (!isValidThrow(firstThrow)) {
    return { valid: false, error: '1投目は0-10の整数で入力してください' };
  }

  // Strike - no second throw
  if (firstThrow === 10) {
    if (secondThrow !== null) {
      return { valid: false, error: 'ストライクの場合、2投目は入力できません' };
    }
    return { valid: true };
  }

  // Not a strike - need second throw
  if (secondThrow === null) {
    return { valid: false, error: '2投目を入力してください' };
  }

  if (!isValidThrow(secondThrow, 10 - firstThrow)) {
    return { valid: false, error: `2投目は0-${10 - firstThrow}で入力してください` };
  }

  if (thirdThrow !== null) {
    return { valid: false, error: '10フレーム以外で3投目は入力できません' };
  }

  return { valid: true };
};

/**
 * Check if all frames are complete and valid
 */
export const isGameComplete = (frames: Frame[]): boolean => {
  return frames.every((frame) => {
    const validation = validateFrame(
      frame.frameNumber,
      frame.firstThrow,
      frame.secondThrow,
      frame.thirdThrow
    );
    return validation.valid;
  });
};
