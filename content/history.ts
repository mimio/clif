import type { AnchorId } from 'content/anchors';

/*
 * The six work-history stops, in chronological order. Dates were epoch
 * milliseconds in the old makeHistoryData/features.ts; they are ISO dates
 * here because nothing needs sub-day precision and a date reads. The
 * originals, for the record:
 *   1420348252000 1467609052000 1470287452000 1486185052000
 *   1503378652000 1545455452000 1579480362000 1595228400000
 *
 * The first stop is 2,400 miles from the other five. The old map excluded it
 * when fitting bounds ("outlier"); the new scene frames Portland and lets the
 * chronological line run off east to Albany, so the flag is gone.
 */
export type HistoryStop = {
  id: number;
  company: string;
  role: string;
  /** Free text, not an anchor name: these are workplaces, not project sites. */
  location: string;
  anchor: AnchorId | null;
  description: string;
  /** ISO dates. A null end means "current". */
  start: string;
  end: string | null;
  coordinates: [number, number];
};

export const historyStops: HistoryStop[] = [
  {
    id: 1,
    company: 'New York State Parks',
    role: 'Geospatial Technician I',
    location: 'Albany NY',
    anchor: null,
    description:
      'I produced over 100 trailmaps and master planning maps for 20 New York state parks using ArcGIS 10.3, Python scripting, and Adobe Illustrator.',
    start: '2015-01-04',
    end: '2016-07-04',
    coordinates: [-73.7508132, 42.652377],
  },
  {
    id: 2,
    company: 'City of Tigard',
    role: 'Geospatial Technician I',
    location: 'Tigard OR',
    anchor: null,
    description:
      'I automated city GIS workflows using Python. I also created data products including complex transportation layers and published web applications using ArcGIS Online.',
    start: '2016-08-04',
    end: '2017-02-04',
    coordinates: [-122.7689952, 45.424939],
  },
  {
    id: 3,
    company: 'Nike',
    role: 'Software Engineer',
    location: 'Beaverton OR',
    anchor: 'beaverton',
    description:
      "I worked for Nike Digital's Content Management Service, helping to streamline the creation of content for Nike.com.",
    start: '2017-08-22',
    end: '2018-12-22',
    coordinates: [-122.8303353, 45.5077801],
  },
  {
    id: 4,
    company: 'Ubiquiti',
    role: 'Software Engineer',
    location: 'Portland OR',
    anchor: 'portland',
    description:
      'I sat in between design and project managers to create consumer facing tools and user interfaces in use by many thousands of customers.',
    start: '2018-12-22',
    end: '2020-01-20',
    coordinates: [-122.6854872, 45.5121414],
  },
  {
    id: 5,
    company: 'Freelancing',
    role: 'Software Engineer & Designer',
    location: 'Portland OR',
    anchor: 'portland',
    description:
      'I worked with a variety of clients including Heroku, &yet, and Ramboll Shair.',
    start: '2020-01-20',
    end: '2020-07-20',
    coordinates: [-122.6997509, 45.5784006],
  },
  {
    id: 6,
    company: 'Salesforce',
    role: 'Senior Software Engineer',
    location: 'Portland OR',
    anchor: 'portland',
    description:
      'Rewrote developer.salesforce.com in less than a year, seamlessly transitioning millions of customers per month to a modern application stack.\n\nAfterwards, I moved to appexchange.salesforce.com where I am leading the revitalization of their design system and constructing customer buying experiences for Salesforce plugins.',
    start: '2020-07-20',
    end: null,
    coordinates: [-122.7944, 45.5424562],
  },
];

/** The scrubber's endpoints, as the artboards label them. */
export const timeline = { from: '2015', to: '2026' };

export const historyById: Record<number, HistoryStop> =
  Object.fromEntries(historyStops.map((stop) => [stop.id, stop]));
