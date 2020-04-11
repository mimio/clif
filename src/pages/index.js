import { HELLO, WORK, PROJECTS } from 'constants/pages';
import Home from './Home';
import Work from './Work';
import Projects from './Projects';

export default [
  { id: HELLO, path: `/${HELLO}`, component: Home },
  { id: PROJECTS, path: `/${PROJECTS}`, component: Projects },
  { id: WORK, path: `/${WORK}`, component: Work },
];
