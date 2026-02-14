export type BlockLayout =
  | 'LINK'
  | 'CHALLENGE_LIST'
  | 'CHALLENGE_GRID'
  | 'DIALOGUE_GRID'
  | 'PROJECT_LIST'
  | 'LEGACY_CHALLENGE_LIST'
  | 'LEGACY_CHALLENGE_GRID'
  | 'LEGACY_LINK';

export const BLOCK_LAYOUTS: BlockLayout[] = [
  'LINK',
  'CHALLENGE_LIST',
  'CHALLENGE_GRID',
  'DIALOGUE_GRID',
  'PROJECT_LIST',
  'LEGACY_CHALLENGE_LIST',
  'LEGACY_CHALLENGE_GRID',
  'LEGACY_LINK',
];

export type BlockLabel =
  | 'LECTURE'
  | 'LAB'
  | 'WORKSHOP'
  | 'REVIEW'
  | 'QUIZ'
  | 'EXAM'
  | 'WARM_UP'
  | 'PRACTICE'
  | 'LEARN';

export const BLOCK_LABELS: BlockLabel[] = [
  'LECTURE',
  'LAB',
  'WORKSHOP',
  'REVIEW',
  'QUIZ',
  'EXAM',
  'WARM_UP',
  'PRACTICE',
  'LEARN',
];

export interface SuperblockListItem {
  name: string;
  dashedName: string;
  isCertification: boolean;
}

export interface SuperblockDetail {
  name: string;
  dashedName: string;
  isCertification: boolean;
  blocks: string[];
  blockObjects: BlockListItem[];
}

export interface BlockListItem {
  name: string;
  dashedName: string;
  helpCategory: string;
  blockLayout: BlockLayout;
  blockLabel: BlockLabel | null;
  isUpcomingChange: boolean;
}

export interface BlockDetail {
  name: string;
  dashedName: string;
  helpCategory: string;
  blockLayout: BlockLayout;
  blockLabel: BlockLabel | null;
  isUpcomingChange: boolean;
  usesMultifileEditor: boolean | null;
  hasEditableBoundaries: boolean | null;
  challengeOrder: ChallengeOrderEntry[];
  superblocks: SuperblockRef[];
}

export interface SuperblockRef {
  name: string;
  dashedName: string;
}

export interface ChallengeOrderEntry {
  id: string;
  title: string;
}

export interface ChallengeDetail {
  id: string;
  title: string;
  block: {
    name: string;
    dashedName: string;
  };
  content: { description: string } | null;
}

export interface CurriculumOverviewResult {
  curriculum: {
    superblocks: string[];
    certifications: string[];
  };
  superblocks: Array<SuperblockListItem & { blocks: string[] }>;
  certifications: Array<{ dashedName: string }>;
}

export interface SuperblockListResult {
  superblocks: SuperblockListItem[];
}

export interface SuperblockDetailResult {
  superblock: SuperblockDetail | null;
}

export interface BlockDetailResult {
  block: BlockDetail | null;
}

export interface ChallengeDetailResult {
  challenge: ChallengeDetail | null;
}
