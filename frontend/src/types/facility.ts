// Facility and Tournament related type definitions

export type FacilityMemberRole = 'owner' | 'manager' | 'staff';
export type TournamentLevel = 'beginner' | 'intermediate' | 'advanced';
export type TournamentStatus = 'upcoming' | 'completed' | 'cancelled';
export type RecurringFrequency = 'weekly' | 'monthly';

/**
 * Company (企業)
 * Represents the organization that owns facilities
 */
export interface Company {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

/**
 * Facility (施設)
 * Bowling facility information
 */
export interface Facility {
  id: string;
  name: string;
  branchName?: string; // 支店名（オプション）
  address: string;
  prefecture: string;
  city: string;
  phoneNumber: string;
  businessHours: {
    open: string;  // Format: "HH:mm" (e.g., "10:00")
    close: string; // Format: "HH:mm" (e.g., "22:00")
  };
  pocketTables: number;   // ポケット台数 (0-50)
  caromTables: number;    // キャロム台数 (0-50)
  snookerTables: number;  // スヌーカー台数 (0-50)
  numberOfLanes: number;  // 合計台数/レーン数 (自動計算)
  companyId: string;
  createdBy?: string; // 作成者のuserId（申請者）
  approved?: Date; // 承認日時（未設定の場合は申請中）
  createdAt: Date;
  updatedAt: Date;
}

/**
 * FacilityMember (所属管理)
 * Many-to-many relationship between users and facilities
 */
export interface FacilityMember {
  id: string;
  userId: string;
  facilityId: string;
  companyId: string;
  role: FacilityMemberRole;
  contractType: string;
  createdAt: Date;
}

/**
 * RecurringPattern (定期開催パターン)
 * Pattern definition for recurring tournaments
 */
export interface RecurringPattern {
  frequency: RecurringFrequency;
  weekOfMonth?: number;  // 1-5 (第N週) - required for monthly
  dayOfWeek: number;     // 0-6 (0=Sunday, 1=Monday, ..., 6=Saturday)
  time: string;          // Format: "HH:mm" (e.g., "19:00")
}

/**
 * RecurringTournament (定期開催試合テンプレート)
 * Template for recurring tournaments (e.g., "毎月第3水曜")
 */
export interface RecurringTournament {
  id: string;
  facilityId: string;
  title: string;
  description: string;
  pattern: RecurringPattern;
  entryFee: number;
  level: TournamentLevel | TournamentLevel[]; // 単一または複数レベル対応
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tournament (試合イベント)
 * Actual tournament event (generated from RecurringTournament or created as one-time event)
 */
export interface Tournament {
  id: string;
  facilityId: string;
  recurringId: string | null;  // Reference to RecurringTournament (null for one-time events)
  title: string;
  description: string;
  eventDate: Date;
  entryFee: number;
  level: TournamentLevel;
  status: TournamentStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TournamentResult (試合結果)
 * Result record for a tournament (recorded by facility manager)
 */
export interface TournamentResult {
  id: string;
  userId: string;
  gameId: string;       // Reference to Game in games collection
  totalScore: number;
  ranking: number;
  recordedBy: string;   // Facility manager user ID
  recordedAt: Date;
}

/**
 * TournamentSearchFilters (検索フィルター)
 * Filters for tournament search
 */
export interface TournamentSearchFilters {
  prefecture?: string;
  city?: string;
  minEntryFee?: number;
  maxEntryFee?: number;
  level?: TournamentLevel;
  startDate?: Date;
  endDate?: Date;
}

/**
 * TournamentWithFacility (施設情報付き試合)
 * Tournament joined with facility information for display
 */
export interface TournamentWithFacility extends Tournament {
  facility: Facility;
}
