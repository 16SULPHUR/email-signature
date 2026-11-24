import * as migration_20261122_064227_initial from './20261122_064227_initial';
import * as migration_20261122_070243_submissions from './20261122_070243_submissions';
import * as migration_20261122_082859_templates from './20261122_082859_templates';
import * as migration_20261122_084419_templates from './20261122_084419_templates';
import * as migration_20261123_shared_signatures from './20261123_shared_signatures';
import * as migration_20261124_email_tracking from './20261124_email_tracking';

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
    up: migration_20261122_082859_templates.up,
    down: migration_20261122_082859_templates.down,
    name: '20261122_082859_templates',
  },
  {
    up: migration_20261122_084419_templates.up,
    down: migration_20261122_084419_templates.down,
    name: '20261122_084419_templates',
  },
  {
    up: migration_20261123_shared_signatures.up,
    down: migration_20261123_shared_signatures.down,
    name: '20261123_shared_signatures',
  },
  {
    up: migration_20261124_email_tracking.up,
    down: migration_20261124_email_tracking.down,
    name: '20261124_email_tracking',
  },
];
