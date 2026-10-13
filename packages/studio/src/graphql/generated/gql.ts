/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  '\n  query Superblocks {\n    superblocks {\n      name\n      dashedName\n      isCertification\n    }\n  }\n': typeof types.SuperblocksDocument;
  '\n  query SidebarNav {\n    curriculum {\n      superblocks\n      certifications\n    }\n    superblocks {\n      name\n      dashedName\n      isCertification\n      chapters {\n        dashedName\n        modules {\n          dashedName\n          blocks\n        }\n      }\n    }\n  }\n': typeof types.SidebarNavDocument;
  '\n  query CurriculumOverview {\n    curriculum {\n      superblocks\n      certifications\n    }\n    superblocks {\n      name\n      dashedName\n      isCertification\n      blocks\n    }\n    certifications {\n      dashedName\n    }\n  }\n': typeof types.CurriculumOverviewDocument;
  '\n  query SuperblockDetail($dashedName: String!) {\n    superblock(dashedName: $dashedName) {\n      name\n      dashedName\n      isCertification\n      blocks\n      blockObjects {\n        name\n        dashedName\n        helpCategory\n        blockLayout\n        blockLabel\n        isUpcomingChange\n      }\n    }\n  }\n': typeof types.SuperblockDetailDocument;
  '\n  query ModuleDetail(\n    $superblockDashedName: String\n    $chapterDashedName: String\n  ) {\n    modules(\n      superblockDashedName: $superblockDashedName\n      chapterDashedName: $chapterDashedName\n    ) {\n      dashedName\n      moduleType\n      comingSoon\n      blocks\n      blockObjects {\n        name\n        dashedName\n        helpCategory\n        blockLayout\n        blockLabel\n        isUpcomingChange\n      }\n      chapter {\n        dashedName\n        superblock {\n          name\n          dashedName\n          isCertification\n        }\n      }\n    }\n  }\n': typeof types.ModuleDetailDocument;
  '\n  query BlockDetail($dashedName: String!) {\n    block(dashedName: $dashedName) {\n      name\n      dashedName\n      helpCategory\n      blockLayout\n      blockLabel\n      isUpcomingChange\n      usesMultifileEditor\n      hasEditableBoundaries\n      challengeOrder {\n        id\n        title\n      }\n      superblocks {\n        name\n        dashedName\n      }\n    }\n  }\n': typeof types.BlockDetailDocument;
  '\n  query ChallengeDetail($id: ID!) {\n    challenge(id: $id) {\n      id\n      title\n      block {\n        name\n        dashedName\n      }\n      content {\n        description\n        instructions\n        files {\n          name\n          ext\n        }\n        tests {\n          text\n        }\n        solutions {\n          files {\n            name\n            ext\n          }\n        }\n      }\n    }\n  }\n': typeof types.ChallengeDetailDocument;
};
const documents: Documents = {
  '\n  query Superblocks {\n    superblocks {\n      name\n      dashedName\n      isCertification\n    }\n  }\n':
    types.SuperblocksDocument,
  '\n  query SidebarNav {\n    curriculum {\n      superblocks\n      certifications\n    }\n    superblocks {\n      name\n      dashedName\n      isCertification\n      chapters {\n        dashedName\n        modules {\n          dashedName\n          blocks\n        }\n      }\n    }\n  }\n':
    types.SidebarNavDocument,
  '\n  query CurriculumOverview {\n    curriculum {\n      superblocks\n      certifications\n    }\n    superblocks {\n      name\n      dashedName\n      isCertification\n      blocks\n    }\n    certifications {\n      dashedName\n    }\n  }\n':
    types.CurriculumOverviewDocument,
  '\n  query SuperblockDetail($dashedName: String!) {\n    superblock(dashedName: $dashedName) {\n      name\n      dashedName\n      isCertification\n      blocks\n      blockObjects {\n        name\n        dashedName\n        helpCategory\n        blockLayout\n        blockLabel\n        isUpcomingChange\n      }\n    }\n  }\n':
    types.SuperblockDetailDocument,
  '\n  query ModuleDetail(\n    $superblockDashedName: String\n    $chapterDashedName: String\n  ) {\n    modules(\n      superblockDashedName: $superblockDashedName\n      chapterDashedName: $chapterDashedName\n    ) {\n      dashedName\n      moduleType\n      comingSoon\n      blocks\n      blockObjects {\n        name\n        dashedName\n        helpCategory\n        blockLayout\n        blockLabel\n        isUpcomingChange\n      }\n      chapter {\n        dashedName\n        superblock {\n          name\n          dashedName\n          isCertification\n        }\n      }\n    }\n  }\n':
    types.ModuleDetailDocument,
  '\n  query BlockDetail($dashedName: String!) {\n    block(dashedName: $dashedName) {\n      name\n      dashedName\n      helpCategory\n      blockLayout\n      blockLabel\n      isUpcomingChange\n      usesMultifileEditor\n      hasEditableBoundaries\n      challengeOrder {\n        id\n        title\n      }\n      superblocks {\n        name\n        dashedName\n      }\n    }\n  }\n':
    types.BlockDetailDocument,
  '\n  query ChallengeDetail($id: ID!) {\n    challenge(id: $id) {\n      id\n      title\n      block {\n        name\n        dashedName\n      }\n      content {\n        description\n        instructions\n        files {\n          name\n          ext\n        }\n        tests {\n          text\n        }\n        solutions {\n          files {\n            name\n            ext\n          }\n        }\n      }\n    }\n  }\n':
    types.ChallengeDetailDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query Superblocks {\n    superblocks {\n      name\n      dashedName\n      isCertification\n    }\n  }\n'
): (typeof documents)['\n  query Superblocks {\n    superblocks {\n      name\n      dashedName\n      isCertification\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query SidebarNav {\n    curriculum {\n      superblocks\n      certifications\n    }\n    superblocks {\n      name\n      dashedName\n      isCertification\n      chapters {\n        dashedName\n        modules {\n          dashedName\n          blocks\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query SidebarNav {\n    curriculum {\n      superblocks\n      certifications\n    }\n    superblocks {\n      name\n      dashedName\n      isCertification\n      chapters {\n        dashedName\n        modules {\n          dashedName\n          blocks\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query CurriculumOverview {\n    curriculum {\n      superblocks\n      certifications\n    }\n    superblocks {\n      name\n      dashedName\n      isCertification\n      blocks\n    }\n    certifications {\n      dashedName\n    }\n  }\n'
): (typeof documents)['\n  query CurriculumOverview {\n    curriculum {\n      superblocks\n      certifications\n    }\n    superblocks {\n      name\n      dashedName\n      isCertification\n      blocks\n    }\n    certifications {\n      dashedName\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query SuperblockDetail($dashedName: String!) {\n    superblock(dashedName: $dashedName) {\n      name\n      dashedName\n      isCertification\n      blocks\n      blockObjects {\n        name\n        dashedName\n        helpCategory\n        blockLayout\n        blockLabel\n        isUpcomingChange\n      }\n    }\n  }\n'
): (typeof documents)['\n  query SuperblockDetail($dashedName: String!) {\n    superblock(dashedName: $dashedName) {\n      name\n      dashedName\n      isCertification\n      blocks\n      blockObjects {\n        name\n        dashedName\n        helpCategory\n        blockLayout\n        blockLabel\n        isUpcomingChange\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query ModuleDetail(\n    $superblockDashedName: String\n    $chapterDashedName: String\n  ) {\n    modules(\n      superblockDashedName: $superblockDashedName\n      chapterDashedName: $chapterDashedName\n    ) {\n      dashedName\n      moduleType\n      comingSoon\n      blocks\n      blockObjects {\n        name\n        dashedName\n        helpCategory\n        blockLayout\n        blockLabel\n        isUpcomingChange\n      }\n      chapter {\n        dashedName\n        superblock {\n          name\n          dashedName\n          isCertification\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query ModuleDetail(\n    $superblockDashedName: String\n    $chapterDashedName: String\n  ) {\n    modules(\n      superblockDashedName: $superblockDashedName\n      chapterDashedName: $chapterDashedName\n    ) {\n      dashedName\n      moduleType\n      comingSoon\n      blocks\n      blockObjects {\n        name\n        dashedName\n        helpCategory\n        blockLayout\n        blockLabel\n        isUpcomingChange\n      }\n      chapter {\n        dashedName\n        superblock {\n          name\n          dashedName\n          isCertification\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query BlockDetail($dashedName: String!) {\n    block(dashedName: $dashedName) {\n      name\n      dashedName\n      helpCategory\n      blockLayout\n      blockLabel\n      isUpcomingChange\n      usesMultifileEditor\n      hasEditableBoundaries\n      challengeOrder {\n        id\n        title\n      }\n      superblocks {\n        name\n        dashedName\n      }\n    }\n  }\n'
): (typeof documents)['\n  query BlockDetail($dashedName: String!) {\n    block(dashedName: $dashedName) {\n      name\n      dashedName\n      helpCategory\n      blockLayout\n      blockLabel\n      isUpcomingChange\n      usesMultifileEditor\n      hasEditableBoundaries\n      challengeOrder {\n        id\n        title\n      }\n      superblocks {\n        name\n        dashedName\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query ChallengeDetail($id: ID!) {\n    challenge(id: $id) {\n      id\n      title\n      block {\n        name\n        dashedName\n      }\n      content {\n        description\n        instructions\n        files {\n          name\n          ext\n        }\n        tests {\n          text\n        }\n        solutions {\n          files {\n            name\n            ext\n          }\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query ChallengeDetail($id: ID!) {\n    challenge(id: $id) {\n      id\n      title\n      block {\n        name\n        dashedName\n      }\n      content {\n        description\n        instructions\n        files {\n          name\n          ext\n        }\n        tests {\n          text\n        }\n        solutions {\n          files {\n            name\n            ext\n          }\n        }\n      }\n    }\n  }\n'];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
