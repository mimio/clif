import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { ChildrenPropType } from 'utils/prop-types';
import { getBool, getStyle } from 'styles/utils';
import { size } from 'styles/size';
import { mobile, tablet, mq } from 'styles/breakpoints';
import {
  centered,
  full,
  foregroundContentTopPadding,
} from 'styles/layout';
import { Heading } from './text';
import { Full, Column } from './layout';

const HeaderContainer = styled(Column)`
  ${full};
  align-items: flex-start;
  height: min-content;
  top: ${getStyle('pageMinimumPadding')};
  width: calc(100% - ${size(15)});
  z-index: 1;
  ${getBool(
    'hasForeground',
    `
    background-image: ${getStyle('fadeIntoBackground')};
  `,
  )};
  ${Heading} {
    opacity: 1;
    width: 100%;
    will-change: opacity;
  }
  > * {
    pointer-events: auto;
  }
`;

const ForegroundContentContainer = styled(Full)`
  align-items: flex-start;
  z-index: 2;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  pointer-events: auto;
  ${foregroundContentTopPadding};
  ${mq({
    paddingRight: [
      getStyle('foregroundContentRightPadding'),
      getStyle('foregroundContentRightPaddingTablet'),
      getStyle('foregroundContentRightPaddingMobile'),
    ],
  })};
  > *:not(:last-child) {
    margin-bottom: ${size(27)};
  }
  ${mobile(`
    > *:not(:last-child) {
      margin-bottom: ${size(13)};
    }
  `)}
`;

const pageSlideIn = `
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
  animation: 0.6s ease-out forwards slidein;
`;

const ForegroundContainer = styled.div`
  z-index: 3;
  position: absolute;
  ${pageSlideIn};
  height: 100%;
  left: ${getStyle('foregroundLeftPadding')};
  width: calc(100% - ${size(28)});
  pointer-events: none;
  ${tablet(`
    left: ${getStyle('foregroundLeftPaddingTablet')};
    width: calc(100% - ${getStyle('pageMinimumPadding')});
  `)}
`;

const BackgroundContainer = styled(Full)`
  z-index: 0;
  ${centered};
`;

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

const Page = ({
  className,
  Background,
  Subheader,
  backgroundCss,
  children,
  fadeForeground,
  title,
}) => {
  const headerContainer = useRef(null);
  const foregroundContent = useRef(null);
  const header = useRef(null);

  useEffect(() => {
    let request;
    const renderHeaderStyles = () => {
      if (
        foregroundContent.current &&
        header.current &&
        foregroundContent.current
      ) {
        const threshold = headerContainer.current.clientHeight;
        const { scrollTop } = foregroundContent.current;
        header.current.style.opacity =
          1 - (scrollTop / threshold) * 0.5;
      }
      request = requestAnimationFrame(renderHeaderStyles);
    };
    request = requestAnimationFrame(renderHeaderStyles);
    return () => {
      if (request) cancelAnimationFrame(request);
    };
  }, []);

  return (
    <>
      <Container>
        <ForegroundContainer>
          <HeaderContainer
            ref={headerContainer}
            hasForeground={fadeForeground}
            sp={4}
          >
            <Heading ref={header}>{title}</Heading>
            {Subheader}
          </HeaderContainer>
          {children && (
            <ForegroundContentContainer
              className={className}
              ref={foregroundContent}
            >
              {children}
            </ForegroundContentContainer>
          )}
        </ForegroundContainer>
        {Background && (
          <BackgroundContainer css={backgroundCss}>
            {Background}
          </BackgroundContainer>
        )}
      </Container>
    </>
  );
};

Page.propTypes = {
  className: PropTypes.string,
  Background: ChildrenPropType,
  Subheader: ChildrenPropType,
  backgroundCss: PropTypes.string,
  children: ChildrenPropType,
  fadeForeground: PropTypes.bool,
  title: PropTypes.string.isRequired,
};

Page.defaultProps = {
  className: '',
  Background: null,
  Subheader: null,
  backgroundCss: null,
  children: null,
  fadeForeground: false,
};

export default Page;
