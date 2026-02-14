import { gql } from 'urql';

export const SUPERBLOCKS_QUERY = gql`
  query Superblocks {
    superblocks {
      name
      dashedName
      isCertification
    }
  }
`;

export const CURRICULUM_OVERVIEW_QUERY = gql`
  query CurriculumOverview {
    curriculum {
      superblocks
      certifications
    }
    superblocks {
      name
      dashedName
      isCertification
      blocks
    }
    certifications {
      dashedName
    }
  }
`;

export const SUPERBLOCK_DETAIL_QUERY = gql`
  query SuperblockDetail($dashedName: String!) {
    superblock(dashedName: $dashedName) {
      name
      dashedName
      isCertification
      blocks
      blockObjects {
        name
        dashedName
        helpCategory
        blockLayout
        blockLabel
        isUpcomingChange
      }
    }
  }
`;

export const BLOCK_DETAIL_QUERY = gql`
  query BlockDetail($dashedName: String!) {
    block(dashedName: $dashedName) {
      name
      dashedName
      helpCategory
      blockLayout
      blockLabel
      isUpcomingChange
      usesMultifileEditor
      hasEditableBoundaries
      challengeOrder {
        id
        title
      }
      superblocks {
        name
        dashedName
      }
    }
  }
`;

export const CHALLENGE_DETAIL_QUERY = gql`
  query ChallengeDetail($id: ID!) {
    challenge(id: $id) {
      id
      title
      block {
        name
        dashedName
      }
      content {
        description
      }
    }
  }
`;
