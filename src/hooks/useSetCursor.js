import { useEffect } from 'react';
import { get } from 'lodash-es';
import { setCursor as setCursorAction } from 'modules/app';
import useActions from './useActions';

const isElementActive = element =>
  ['BUTTON', 'A'].includes(get(element, 'nodeName'));

export default function useSetCursor() {
  const setCursor = useActions(setCursorAction);

  return useEffect(() => {
    const mouseListener = window.addEventListener(
      'mousemove',
      ({ clientX, clientY, target }) => {
        const isActive =
          isElementActive(target) ||
          isElementActive(target.parentElement);
        setCursor({ x: clientX, y: clientY, isActive });
      },
    );
    return () => {
      window.removeEventListener('mousemove', mouseListener);
    };
  }, []);
}
