import { selectIsMobile } from 'modules/app/appSlice';
import { useAppSelector } from 'modules/hooks';
import Page from 'components/Page';
import Popup from 'pagesComponents/history/Popup';
import Map from 'pagesComponents/history/Map';
import Controls from 'pagesComponents/history/Controls';

const History = () => {
  const isMobile = useAppSelector(selectIsMobile);

  return (
    <Page
      Background={
        <>
          {!isMobile && (
            <Controls className="absolute bottom-4 left-28 z-6 max-desktop:left-4" />
          )}
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
