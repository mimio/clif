import { useEffect } from 'react';
import { screenResized } from 'modules/app/appSlice';
import { useAppDispatch } from 'modules/hooks';

export default function useWatchScreenSize(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const update = () =>
      dispatch(
        screenResized({
          x: window.innerWidth,
          y: window.innerHeight,
        }),
      );
    update();
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
    };
  }, [dispatch]);
}
