import * as migration_20261122_064227_initial from './20261122_064227_initial';
import * as migration_20261122_070243_submissions from './20261122_070243_submissions';
import * as migration_20261122_084419_templates from './20261122_084419_templates';

export const migrations = [
  {
    up: migration_20261122_064227_initial.up,
    down: migration_20261122_064227_initial.down,
    name: '20261122_064227_initial',
  },
  {
    up: migration_20261122_070243_submissions.up,
    down: migration_20261122_070243_submissions.down,
    name: '20261122_070243_submissions',
  },
  {
    up: migration_20261122_084419_templates.up,
    down: migration_20261122_084419_templates.down,
    name: '20261122_084419_templates'
  },
];
