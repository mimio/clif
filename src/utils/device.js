export const isTouchScreen = () => {
  const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
  const _mq = (query) => window.matchMedia(query).matches;
  if (
    'ontouchstart' in window ||
    // eslint-disable-next-line no-undef
    (window.DocumentTouch && document instanceof DocumentTouch)
  ) {
    return true;
  }
  const query = [
    '(',
    prefixes.join('touch-enabled),('),
    'heartz',
    ')',
  ].join('');
  return _mq(query);
};
