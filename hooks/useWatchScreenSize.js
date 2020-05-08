import { useEffect } from 'react';
import { setScreenSize as setScreenSizeAction } from 'modules/app';
import useActions from './useActions';

export default function useWatchScreenSize() {
  const setScreenSize = useActions(setScreenSizeAction);

  return useEffect(() => {
    setScreenSize(window.innerWidth, window.innerHeight);
    const mouseListener = window.addEventListener('resize', (e) =>
      setScreenSize(e.target.innerWidth, e.target.innerHeight),
    );
    return () => {
      window.removeEventListener('resize', mouseListener);
    };
  }, []);
}
