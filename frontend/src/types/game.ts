export interface Frame {
  frameNumber: number;
  firstThrow: number | null;
  secondThrow: number | null;
  thirdThrow: number | null;
  frameScore: number;
  cumulativeScore: number;
  isStrike: boolean;
  isSpare: boolean;
}

export interface Game {
  id: string;
  userId: string;
  playedAt: Date;
  totalScore: number;
  gameNumber: number;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
}
