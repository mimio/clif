import React from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import moment from 'moment';
import { getBool, getStyle } from 'styles/utils';
import { size } from 'styles/size';
import { Column } from 'components/layout';
import { Body, Body2, Detail, Detail2 } from 'components/text';

const Container = styled(Column)`
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

const dateFormat = 'MMM YYYY';

const Popup = ({ popupId, feature, isMobile, isFeatureSelected }) => {
  if (!isFeatureSelected) return null;

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
      ${moment(start).format(dateFormat)}
      ${' '}-${' '}
      ${end ? moment(end).format(dateFormat) : 'Current'}
    `}
      </Detail2>
    </Container>
  );

  if (isMobile) {
    return Content;
  }

  const popupEl = document.getElementById(popupId);
  if (!popupEl) return null;
  return ReactDOM.createPortal(Content, popupEl);
};

Popup.propTypes = {
  feature: PropTypes.object,
  isFeatureSelected: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
  popupId: PropTypes.string,
};

Popup.defaultProps = {
  feature: null,
  popupId: null,
};

export default Popup;
