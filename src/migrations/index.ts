import * as migration_20261122_064227_initial from './20261122_064227_initial';
import * as migration_20261122_070243_submissions from './20261122_070243_submissions';

export const migrations = [
  {
    up: migration_20261122_064227_initial.up,
    down: migration_20261122_064227_initial.down,
    name: '20261122_064227_initial',
  },
  {
    up: migration_20261122_070243_submissions.up,
    down: migration_20261122_070243_submissions.down,
    name: '20261122_070243_submissions'
  },
];
