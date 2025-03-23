import { size } from '../size';

const pageMinimumPadding = size(4);

export default {
  popupWidth: size(96),
  popupMaxHeight: size(65),
  foregroundContentRightPadding: size(30),
  foregroundContentRightPaddingTablet: size(23),
  foregroundContentRightPaddingMobile: size(13),
  foregroundLeftPadding: size(28),
  foregroundLeftPaddingTablet: pageMinimumPadding,
  pageMinimumPadding,
};
