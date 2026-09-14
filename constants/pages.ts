export const HELLO = 'hello';
export const WORK = 'history';
export const PROJECTS = 'projects';

export type TabId = typeof HELLO | typeof WORK | typeof PROJECTS;

export const HELLO_PATH = '/';
export const WORK_PATH = '/history';
export const PROJECTS_PATH = '/projects';

export const orderedTabs: { id: TabId; path: string }[] = [
  { id: HELLO, path: HELLO_PATH },
  { id: PROJECTS, path: PROJECTS_PATH },
  { id: WORK, path: WORK_PATH },
];
