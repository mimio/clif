import styled from '@emotion/styled';
import { selectIsMobile } from 'modules/app/appSlice';
import { useAppSelector } from 'modules/hooks';
import Page from 'components/Page';
import Popup from 'pagesComponents/history/Popup';
import Map from 'pagesComponents/history/Map';
import Controls from 'pagesComponents/history/Controls';
import { getStyle } from 'styles/utils';
import { tablet } from 'styles/breakpoints';

const DesktopControls = styled(Controls)`
  position: absolute;
  left: 0;
  bottom: ${getStyle('pageMinimumPadding')};
  left: ${getStyle('foregroundLeftPadding')};
  z-index: 6;
  ${tablet(`
    left: ${getStyle('pageMinimumPadding')};
  `)}
`;

const History = () => {
  const isMobile = useAppSelector(selectIsMobile);

  return (
    <Page
      Background={
        <>
          {!isMobile && <DesktopControls />}
          <Popup />
          <Map reveal />
        </>
      }
      Subheader={isMobile ? <Controls /> : null}
      title="history"
    />
  );
};

export default History;
