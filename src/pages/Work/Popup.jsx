import React from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import moment from 'moment';
import { getStyle, size } from 'styles';
import { subheader2 } from 'styles/text';
import { ItemColumn, Subheader, Detail, Detail2 } from 'components';

const Container = styled(ItemColumn)`
  background: ${getStyle('background1')};
  align-items: flex-start;
  padding: ${size(4)};
  overflow-y: auto;
  width: 100%;
  height: 100%;
`;

const Company = styled.strong`
  ${subheader2};
`;

const dateFormat = 'MMM YYYY';

const Popup = ({ popupId, feature }) => {
  const popupEl = document.getElementById(popupId);
  if (!popupEl || !feature) return null;
  const {
    company,
    date: { start, end },
    role,
    description,
  } = feature;
  return ReactDOM.createPortal(
    <Container sp={7}>
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
    </Container>,
    popupEl,
  );
};

Popup.propTypes = {
  feature: PropTypes.object,
  popupId: PropTypes.string,
};

Popup.defaultProps = {
  feature: null,
  popupId: null,
};

export default Popup;
