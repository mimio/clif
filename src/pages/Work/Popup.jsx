import React from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import moment from 'moment';
import { getBool, getStyle, size } from 'styles';
import { subheader2 } from 'styles/text';
import { ItemColumn, Subheader, Detail, Detail2 } from 'components';

const Container = styled(ItemColumn)`
  background: ${getStyle('background1')};
  align-items: flex-start;
  padding: ${size(4)};
  overflow-y: auto;
  width: 100%;
  height: 100%;
  ${getBool(
    'isMobile',
    `
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 3;
    padding-right: ${size(16)};
    height: ${size(60)};
  `,
  )};
`;

const Company = styled.strong`
  ${subheader2};
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
    <Container sp={7} isMobile={isMobile}>
      <Subheader>
        {`${role} @ `}
        <Company>{company}</Company>
      </Subheader>
      <Detail>{description}</Detail>
      <Detail2>
        {`
      ${moment(start).format(dateFormat)}
      ${' '}->${' '}
      ${moment(end).format(dateFormat)}
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
