import UFOIcon from 'public/icons/ufo.svg';
import { Heading, Detail } from 'components/text';
import Button from 'components/Button';

const Lost = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-6 [&>a]:mt-10 [&>a]:max-w-[200px]">
    <Heading>404</Heading>
    <Detail>It Looks Like You Are Lost</Detail>
    <Button
      ariaLabel="Link To Homepage"
      internal
      Icon={UFOIcon}
      href="/"
    >
      Take Me Home
    </Button>
  </div>
);

export default Lost;
