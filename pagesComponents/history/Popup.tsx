import { createPortal } from 'react-dom';
import { cn } from 'utils/cn';
import { useAppSelector } from 'modules/hooks';
import { selectIsMobile } from 'modules/app/appSlice';
import {
  selectIsFeatureSelected,
  selectPopupId,
  selectSelectedFeature,
} from 'modules/map/mapSlice';
import { Body, Body2, Detail, Detail2 } from 'components/text';

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
});
const formatDate = (timestamp: number) =>
  dateFormat.format(new Date(timestamp));

const Popup = () => {
  const popupId = useAppSelector(selectPopupId);
  const feature = useAppSelector(selectSelectedFeature);
  const isMobile = useAppSelector(selectIsMobile);
  const isFeatureSelected = useAppSelector(selectIsFeatureSelected);

  if (!isFeatureSelected || !feature) return null;

  const {
    company,
    date: { start, end },
    role,
    description,
  } = feature;
  const Content = (
    <div
      className={cn(
        'flex h-full w-full animate-slide-in-fast flex-col items-start gap-4 overflow-y-auto rounded-[20px] border border-surface-2 bg-surface p-7',
        isMobile &&
          'absolute bottom-1 left-1 z-3 h-auto max-h-60 w-[calc(100%-8px)] pr-14',
      )}
    >
      <Body>
        <b>{role}</b>
        <br />
        <Body2>
          <b>{` @ ${company}`}</b>
        </Body2>
      </Body>
      <Detail>{description}</Detail>
      <Detail2>
        {`
      ${formatDate(start)}
      ${' '}-${' '}
      ${end ? formatDate(end) : 'Current'}
    `}
      </Detail2>
    </div>
  );

  if (isMobile) {
    return Content;
  }

  const popupEl = popupId ? document.getElementById(popupId) : null;
  if (!popupEl) return null;
  return createPortal(Content, popupEl);
};

export default Popup;
