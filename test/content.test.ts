import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { anchorList, anchors, VAIL_VALLEY } from 'content/anchors';
import {
  cameraAtAnchor,
  cameras,
  fogPresets,
  SCENE_EASE,
  SCENE_HANDOFF,
  SCENE_MOVE_LONG_MS,
  SCENE_MOVE_MS,
} from 'content/cameras';
import { EMAIL, MAILTO } from 'content/contact';
import { historyById, historyStops, timeline } from 'content/history';
import projectsById, {
  approximateUserCount,
  projectsList,
} from 'content/projects';
import { projectPath, routeIds, routes } from 'content/routes';

describe('routes', () => {
  it('is hello, projects and about, in rail order', () => {
    expect(routeIds).toEqual(['hello', 'projects', 'about']);
    expect(routes.map((route) => route.path)).toEqual([
      '/',
      '/projects',
      '/about',
    ]);
  });

  it('builds project paths', () => {
    expect(projectPath('gopro')).toBe('/projects/gopro');
  });
});

describe('anchors', () => {
  it('has the eight city anchors', () => {
    expect(anchorList).toHaveLength(8);
    expect(anchors.portland.center).toEqual([-122.68, 45.52]);
    expect(anchors.newYork.center).toEqual([-74.0, 40.71]);
  });

  it('collapses the three Colorado sites for world zoom', () => {
    expect(VAIL_VALLEY.center).toEqual([-106.52, 39.65]);
  });
});

describe('cameras', () => {
  it('uses the artboard values for every scene', () => {
    expect(cameras.hello.zoom).toBe(1.6);
    expect(cameras.hello.spin).toBeCloseTo(0.0015);
    expect(cameras.projects.center).toEqual([-98.0, 39.0]);
    expect(cameras.projects.zoom).toBe(2.6);
    expect(cameras.projects.pitch).toBe(25);
    expect(cameras.projects.bearing).toBe(-12);
    expect(cameras.about.zoom).toBe(10.5);
    expect(cameras.notFound.zoom).toBe(0.8);
  });

  it('holds the camera on the detail route', () => {
    expect(cameras.projectDetail.interactive).toBe(false);
    expect(cameras.projectDetail.terrain).toBe(1.4);
  });

  it('has a fog preset for every camera', () => {
    Object.values(cameras).forEach((camera) => {
      expect(fogPresets[camera.fog]).toBeDefined();
    });
    expect(fogPresets.space.range).toEqual([0.6, 12]);
  });

  it('re-centres a camera on an anchor, keeping its framing', () => {
    const held = cameraAtAnchor(cameras.projectDetail, 'vail');
    expect(held.center).toEqual(anchors.vail.center);
    expect(held.zoom).toBe(cameras.projectDetail.zoom);
  });

  it('exports the shared choreography', () => {
    expect(SCENE_MOVE_MS).toBe(800);
    expect(SCENE_MOVE_LONG_MS).toBe(900);
    expect(SCENE_EASE).toHaveLength(4);
    expect(SCENE_HANDOFF).toBeCloseTo(0.6);
  });
});

describe('contact', () => {
  it('is one address', () => {
    expect(EMAIL).toBe('clif@mimio.io');
    expect(MAILTO).toBe('mailto:clif@mimio.io');
  });
});

describe('history', () => {
  it('has the six stops in chronological order', () => {
    expect(historyStops).toHaveLength(6);
    expect(historyStops.map((stop) => stop.company)).toEqual([
      'New York State Parks',
      'City of Tigard',
      'Nike',
      'Ubiquiti',
      'Freelancing',
      'Salesforce',
    ]);
  });

  it('chains the dates and leaves the last one open', () => {
    expect(historyStops[3].start).toBe(historyStops[2].end);
    expect(historyStops[5].end).toBeNull();
  });

  it('indexes by id and spans the scrubber', () => {
    expect(historyById[4].company).toBe('Ubiquiti');
    expect(timeline).toEqual({ from: '2015', to: '2026' });
  });
});

describe('projects', () => {
  it('has all fourteen, indexed by id', () => {
    expect(projectsList).toHaveLength(14);
    expect(Object.keys(projectsById)).toHaveLength(14);
    expect(projectsById.gopro.client).toBe('970 Design');
  });

  it('wraps prev and next circularly', () => {
    expect(projectsList[0].prevId).toBe('winter');
    expect(projectsList[13].nextId).toBe('haikumi');
  });

  it('buckets user counts and never shows an exact figure', () => {
    expect(approximateUserCount(1300000)).toBe('1,000,000+');
    expect(approximateUserCount(100000)).toBe('100,000+');
    expect(approximateUserCount(4)).toBeNull();
    expect(approximateUserCount(undefined)).toBeNull();
    expect(projectsById.pricing.usersApproximate).toBe('1,000,000+');
    expect(projectsById.haikumi.usersApproximate).toBeNull();
  });

  it('keeps the prose as rich text, links and all', () => {
    const [paragraph] = projectsById.haikumi.description;
    expect(paragraph).toContainEqual({
      text: 'Wieden + Kennedy',
      href: 'https://www.wk.com/',
    });
  });

  /*
   * "Exists" used to mean "matches a regex", which is a claim about the
   * shape of a string and not about the repository: pointing a project at
   * /gopro_skinny.webp -- a file this branch deleted, and a perfectly
   * well-shaped path -- left all eighteen tests green. Both fields are
   * paths under public/ that a route renders as a URL, so what is worth
   * asserting is that the bytes are there. The shape checks stay: they are
   * what keeps a path servable (rooted, lowercase, no query).
   */
  const inPublic = (src: string): string =>
    path.join(process.cwd(), 'public', src);

  it('gives every project an anchor and an icon that exists', () => {
    projectsList.forEach((project) => {
      expect(anchors[project.anchor]).toBeDefined();
      expect(project.iconSrc).toMatch(/^\/icons\/[a-z-]+\.svg$/);
      expect(project.imgSrc).toMatch(/^\/[a-z_]+\.webp$/);
      // As one object, so a failure names the project rather than
      // reporting that false is not true, twenty-eight paths in.
      expect({
        icon: existsSync(inPublic(project.iconSrc)),
        id: project.id,
        image: existsSync(inPublic(project.imgSrc)),
      }).toEqual({ icon: true, id: project.id, image: true });
    });
  });

  it('would notice a path that only looks right', () => {
    // The deleted file the regexes are perfectly happy with, which is what
    // made the old check unfalsifiable.
    expect('/gopro_skinny.webp').toMatch(/^\/[a-z_]+\.webp$/);
    expect(existsSync(inPublic('/gopro_skinny.webp'))).toBe(false);
  });
});
