import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import type { HistoryFeature } from 'makeHistoryData/features';
import { getBool, getStyle } from 'styles/utils';
import { size } from 'styles/size';
import { Column } from 'components/layout';
import { Body, Body2, Detail, Detail2 } from 'components/text';

const Container = styled(Column)<{ isMobile: boolean }>`
  background: ${getStyle('background1')};
  align-items: flex-start;
  padding: ${size(7)};
  overflow-y: auto;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  border: ${getStyle('contentBorder')};
  @keyframes slidein {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  animation: 0.22s linear forwards slidein;
  ${getBool(
    'isMobile',
    `
    position: absolute;
    bottom: 4px;
    left: 4px;
    z-index: 3;
    padding-right: ${size(14)};
    width: calc(100% - 8px);
    height: unset;
    max-height: ${size(60)};
  `,
  )};
`;

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
});
const formatDate = (timestamp: number) =>
  dateFormat.format(new Date(timestamp));

export type PopupProps = {
  popupId: string | null;
  feature?: HistoryFeature;
  isMobile: boolean;
  isFeatureSelected: boolean;
};

const Popup = ({
  popupId,
  feature,
  isMobile,
  isFeatureSelected,
}: PopupProps) => {
  if (!isFeatureSelected || !feature) return null;

  const {
    company,
    date: { start, end },
    role,
    description,
  } = feature;
  const Content = (
    <Container sp={4} isMobile={isMobile}>
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
    </Container>
  );

  if (isMobile) {
    return Content;
  }

  const popupEl = popupId ? document.getElementById(popupId) : null;
  if (!popupEl) return null;
  return createPortal(Content, popupEl);
};

export default Popup;
