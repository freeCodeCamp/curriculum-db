import type { Resolvers } from '../types.generated.js';
import { Query } from './Query.js';
import { Block } from './Block.js';
import { Challenge } from './Challenge.js';
import { Superblock } from './Superblock.js';
import { Chapter } from './Chapter.js';
import { Module } from './Module.js';
import { Certification } from './Certification.js';

export const resolvers: Resolvers = {
  Query,
  Block,
  Challenge,
  Superblock,
  Chapter,
  Module,
  Certification,
};
