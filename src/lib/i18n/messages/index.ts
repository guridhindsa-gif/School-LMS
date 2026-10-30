import { common } from './common';
import { student } from './student';
import { lesson } from './lesson';
import { pages } from './pages';
import { roles } from './roles';
import { landing } from './landing';
import { labs_primary } from './labs-primary';
import { labs_middle } from './labs-middle';
import { labs_science } from './labs-science';
import { labs_senior } from './labs-senior';

export type Lang = 'en' | 'hi' | 'pa';
export type Dict = Record<Lang, Record<string, string>>;

/** Order matters only for duplicate keys (first wins); keys should be unique across files. */
export const DICTS: Dict[] = [common, student, lesson, pages, roles, landing, labs_primary, labs_middle, labs_science, labs_senior];
