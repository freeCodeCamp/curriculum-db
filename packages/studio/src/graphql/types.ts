import type {
  BlockDetailQuery,
  BlockLabel as GeneratedBlockLabel,
  BlockLayout as GeneratedBlockLayout,
  ChallengeDetailQuery,
  CurriculumOverviewQuery,
  ModuleDetailQuery,
  SidebarNavQuery,
  SuperblockDetailQuery,
  SuperblocksQuery,
} from './generated/graphql';

type NonNull<T> = NonNullable<T>;

export type BlockLayout = GeneratedBlockLayout;

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

export type BlockLabel = GeneratedBlockLabel;

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

export type SuperblockListItem = SuperblocksQuery['superblocks'][number];
export type SidebarSuperblockListItem = SidebarNavQuery['superblocks'][number];
export type SidebarChapterListItem =
  SidebarSuperblockListItem['chapters'][number];
export type SidebarModuleListItem = SidebarChapterListItem['modules'][number];
export type SidebarNavResult = SidebarNavQuery;

export type SuperblockDetail = NonNull<SuperblockDetailQuery['superblock']>;
export type ModuleDetail = ModuleDetailQuery['modules'][number];
export type BlockListItem = SuperblockDetail['blockObjects'][number];

export type BlockDetail = NonNull<BlockDetailQuery['block']>;
export type SuperblockRef = BlockDetail['superblocks'][number];
export type ChallengeOrderEntry = BlockDetail['challengeOrder'][number];

export type ChallengeDetail = NonNull<ChallengeDetailQuery['challenge']>;
export type ChallengeContent = NonNull<ChallengeDetail['content']>;

export type CurriculumOverviewResult = CurriculumOverviewQuery;
export type SuperblockListResult = SuperblocksQuery;
export type SuperblockDetailResult = SuperblockDetailQuery;
export type ModuleDetailResult = ModuleDetailQuery;
export type BlockDetailResult = BlockDetailQuery;
export type ChallengeDetailResult = ChallengeDetailQuery;
