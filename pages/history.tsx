import { connect } from 'react-redux';
import styled from '@emotion/styled';
import { selectIsMobile } from 'modules/app/selectors';
import type { RootState } from 'modules/store';
import Page from 'components/Page';
import Popup from 'pagesComponents/history/containers/Popup';
import Map from 'pagesComponents/history/containers/Map';
import Controls from 'pagesComponents/history/containers/Controls';
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

type HistoryProps = {
  isMobile: boolean;
};

const History = ({ isMobile }: HistoryProps) => (
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

export default connect(
  (state: RootState) => ({
    isMobile: selectIsMobile(state),
  }),
  null,
)(History);
