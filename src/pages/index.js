import React from 'react';
import { useParams } from 'react-router-dom';
import { HELLO, WORK, PROJECTS } from 'constants/tabs';
import Home from './Home';
import Work from './Work';
import Projects from './Projects';

const pages = {
  [HELLO]: Home,
  [PROJECTS]: Projects,
  [WORK]: Work,
};

export default () => {
  const { tabId } = useParams();
  const Page = pages[tabId];
  return <Page />;
};
