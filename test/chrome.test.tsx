import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import Altimeter, {
  ALTIMETER_NOTCHES,
  beadPosition,
} from 'components/chrome/Altimeter';
import ChromeRoot, {
  DETAIL_INDICATOR,
  routeIdForPath,
} from 'components/chrome/ChromeRoot';
import ContactMouth, {
  COPIED_MS,
} from 'components/chrome/ContactMouth';
import CoordPill, {
  formatCoordinates,
} from 'components/chrome/CoordPill';
import ThemeEye from 'components/chrome/ThemeEye';
import { cameras } from 'content/cameras';
import { SceneContext } from 'scene/MapProvider';

const pathname = vi.hoisted(() => ({ current: '/' }));

vi.mock('next/router', () => ({
  useRouter: () => ({ pathname: pathname.current }),
}));

beforeEach(() => {
  pathname.current = '/';
});

afterEach(() => {
  delete document.documentElement.dataset.theme;
  window.localStorage.clear();
});

describe('Altimeter', () => {
  it('sits on a notch, and on none when nothing is active', () => {
    expect(beadPosition('projects', null)).toBe(ALTIMETER_NOTCHES[1]);
    expect(beadPosition(null, null)).toBe(ALTIMETER_NOTCHES[0]);
  });

  it('lets an explicit indicator win, as the detail route does', () => {
    expect(beadPosition('projects', DETAIL_INDICATOR)).toBeCloseTo(
      20 + 0.62 * 80,
    );
  });

  it('renders one notch per route and navigates', async () => {
    const onNavigate = vi.fn();
    const { rerender } = render(<Altimeter />);
    expect(screen.getAllByRole('button')).toHaveLength(3);

    rerender(
      <Altimeter
        active="about"
        className="x"
        indicator={0.5}
        onNavigate={onNavigate}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: /projects/ }),
    );
    expect(onNavigate).toHaveBeenCalledWith('projects');
  });

  it('survives having no navigate handler', async () => {
    render(<Altimeter active="hello" />);
    await userEvent.click(
      screen.getByRole('button', { name: /about/ }),
    );
  });
});

describe('ThemeEye', () => {
  it('opens, applies a theme and stays open for comparison', async () => {
    const onChange = vi.fn();
    render(<ThemeEye onChange={onChange} value="yellow" />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Theme' }),
    );
    await userEvent.click(
      screen.getByRole('option', { name: 'teal' }),
    );
    expect(document.documentElement.dataset.theme).toBe('teal');
    expect(onChange).toHaveBeenCalledWith('teal');
    expect(screen.getByRole('listbox')).toBeVisible();
  });

  it('can start open, and closes on a second click', async () => {
    render(<ThemeEye className="x" defaultOpen />);
    expect(screen.getByRole('listbox')).toBeVisible();
    await userEvent.click(
      screen.getByRole('button', { name: 'Theme' }),
    );
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('applies without a change handler', async () => {
    render(<ThemeEye defaultOpen />);
    await userEvent.click(
      screen.getByRole('option', { name: 'pink' }),
    );
    expect(document.documentElement.dataset.theme).toBe('pink');
  });
});

describe('ContactMouth', () => {
  it('opens onto the one address', async () => {
    render(<ContactMouth />);
    expect(screen.queryByRole('link')).toBeNull();
    await userEvent.click(
      screen.getByRole('button', { name: 'Contact' }),
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'mailto:clif@mimio.io',
    );
    expect(COPIED_MS).toBe(1600);
  });

  it('can start open with a different address', async () => {
    render(
      <ContactMouth className="x" defaultOpen email="hi@x.io" />,
    );
    expect(screen.getByText('hi@x.io')).toBeVisible();
    await userEvent.click(
      screen.getByRole('button', { name: 'Contact' }),
    );
    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('CoordPill', () => {
  it('reads lat, lng to three decimals', () => {
    expect(formatCoordinates(-122.658, 45.512)).toBe(
      '45.512, -122.658',
    );
  });

  it('says camera by default and held when told', () => {
    const { rerender } = render(
      <CoordPill lat={45.5} lng={-122.7} />,
    );
    expect(screen.getByText('camera')).toBeVisible();
    rerender(
      <CoordPill
        className="x"
        label="held"
        lat={39.641}
        lng={-106.355}
      />,
    );
    expect(screen.getByText('held')).toBeVisible();
  });
});

describe('ChromeRoot', () => {
  it('maps a pathname to the rail notch', () => {
    expect(routeIdForPath('/')).toBe('hello');
    expect(routeIdForPath('/projects')).toBe('projects');
    expect(routeIdForPath('/about')).toBe('about');
    expect(routeIdForPath('/projects/gopro')).toBeNull();
  });

  it('falls back to the opening camera before a route sets one', () => {
    render(<ChromeRoot />);
    expect(screen.getByText('45.500, -122.700')).toBeVisible();
  });

  it('reads the live camera and the live route', () => {
    pathname.current = '/about';
    render(
      <SceneContext.Provider
        value={{ camera: cameras.about, setCamera: vi.fn() }}
      >
        <ChromeRoot className="x" />
      </SceneContext.Provider>,
    );
    expect(screen.getByText('45.512, -122.658')).toBeVisible();
    expect(
      screen.getByRole('button', { name: /about/ }),
    ).toHaveAttribute('aria-current', 'true');
  });
});
