import React from 'react';
import styled from '@emotion/styled';

const StyledVideoContainer = styled.div`
  pointer-events: none;
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  padding-top: 25px;
  height: 0;
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

export default function Video({ url }) {
  const id = url.split('v=')[1];
  const embed = `https://www.youtube.com/embed/${id}?modestbranding=1&amp;loop=1&amp;controls=0&amp;disablekb=0&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1&amp;autoplay=1&amp;muted=1`;

  return (
    <StyledVideoContainer>
      <iframe
        id="player"
        title="video"
        src={embed}
        allowFullScreen
        allowTransparency
        allow="autoplay"
      />
    </StyledVideoContainer>
  );
}
