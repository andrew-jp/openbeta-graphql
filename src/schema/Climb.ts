import { gql } from "apollo-server";

export const typeDef = gql`
  type Query {
    climb(ID: Int!): Climb
  }

  type Climb {
    name: String!
    fa: String!
    yds: String!
    safety: SafetyEnum!
    metadata: ClimbMetadata!
  }

  type ClimbMetadata {
    lat: Float
    lng: Float
    left_right_index: Int
    mp_id: String
    climb_id: String!
  }

  type ClimbType {
    trad: Boolean
    sport: Boolean
    bouldering: Boolean
    alpine: Boolean
    mixed: Boolean
    aid: Boolean
    tr: Boolean
  }

  enum SafetyEnum {
    UNSPECIFIED
    PG
    PG13
    R
    X
  }
`;
