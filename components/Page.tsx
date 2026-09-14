import { useEffect, useRef, type ReactNode } from 'react';
import styled from '@emotion/styled';
import { getStyle } from 'styles/utils';
import { size } from 'styles/size';
import { mobile, tablet, mq } from 'styles/breakpoints';
import {
  centered,
  full,
  foregroundContentTopPadding,
  type LayoutProps,
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

const BackgroundContainer = styled(Full)<LayoutProps>`
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

export type PageProps = {
  className?: string;
  Background?: ReactNode;
  Subheader?: ReactNode;
  children?: ReactNode;
  title: string;
};

const Page = ({
  className = '',
  Background = null,
  Subheader = null,
  children = null,
  title,
}: PageProps) => {
  const headerContainer = useRef<HTMLDivElement>(null);
  const foregroundContent = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let request = 0;
    const renderHeaderStyles = () => {
      if (
        foregroundContent.current &&
        header.current &&
        headerContainer.current
      ) {
        const threshold = headerContainer.current.clientHeight;
        const { scrollTop } = foregroundContent.current;
        header.current.style.opacity = String(
          1 - (scrollTop / threshold) * 0.5,
        );
      }
      request = requestAnimationFrame(renderHeaderStyles);
    };
    request = requestAnimationFrame(renderHeaderStyles);
    return () => {
      if (request) cancelAnimationFrame(request);
    };
  }, []);

  return (
    <Container>
      <ForegroundContainer>
        <HeaderContainer ref={headerContainer} sp={4}>
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
        <BackgroundContainer>{Background}</BackgroundContainer>
      )}
    </Container>
  );
};

export default Page;
