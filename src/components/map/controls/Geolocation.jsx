import React, { Component } from 'react';
import styled from '@emotion/styled';
import { getBool, getStyle } from 'styles';
import { get } from 'lodash-es';
import PropTypes from 'prop-types';
import { ReactComponent as Arrow } from './location-arrow.svg';
import Spinner from '../../Spinner';
import { MapButton } from './styles';

const StyledMapButton = styled(MapButton)`
  ${getBool('on', `color: ${getStyle('limeGreen')}`)};
  ${getBool('error', `color: ${getStyle('red')}`)};
`;

class Geolocation extends Component {
  static propTypes = {
    setUserLocation: PropTypes.func.isRequired,
    panToUser: PropTypes.func.isRequired,
  };

  state = {
    error: false,
    loading: false,
    on: false,
  };

  onSuccess = location => {
    const { setUserLocation, panToUser } = this.props;

    setUserLocation(location);
    if (!this.state.on) panToUser();

    this.setState({
      error: false,
      loading: false,
      on: true,
    });
  };

  onError = () => this.setState({ loading: false, error: true });

  watchLocation = () =>
    navigator.geolocation.watchPosition(
      position => {
        const longitude = get(position, 'coords.longitude');
        const latitude = get(position, 'coords.latitude');
        const location = [longitude, latitude];
        this.onSuccess(location);
      },
      this.onError,
      { enableHighAccuracy: true },
    );

  onClick = async () => {
    const { on } = this.state;
    const { panToUser } = this.props;

    if (on) {
      panToUser();
      return;
    }

    this.setState({ loading: true });
    this.watchLocation();
  };

  render() {
    const { on, error, loading } = this.state;
    return (
      <StyledMapButton on={on} error={error} onClick={this.onClick}>
        {loading ? <Spinner /> : <Arrow />}
      </StyledMapButton>
    );
  }
}

export default Geolocation;
