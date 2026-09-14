import { useEffect } from 'react';
import { setScreenSize as setScreenSizeAction } from 'modules/app/actions';
import useActions from './useActions';

export default function useWatchScreenSize(): void {
  const setScreenSize = useActions(setScreenSizeAction);

  useEffect(() => {
    const update = () =>
      setScreenSize(window.innerWidth, window.innerHeight);
    update();
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
    };
  }, [setScreenSize]);
}
