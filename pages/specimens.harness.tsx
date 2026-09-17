import type { GetStaticProps } from 'next';
import foundation from 'pagesComponents/specimens/foundation';
import atoms from 'pagesComponents/specimens/atoms';
import buttons from 'pagesComponents/specimens/buttons';
import chrome from 'pagesComponents/specimens/chrome';
import composed from 'pagesComponents/specimens/composed';
import glyphs from 'pagesComponents/specimens/glyphs';
import scene from 'pagesComponents/specimens/scene';
import tokens from 'pagesComponents/specimens/tokens';
import type { Specimen } from 'pagesComponents/specimens/types';

/*
 * The design harness, reachable at /specimens under `pnpm specimens`.
 *
 * The `.harness.tsx` extension is what keeps it out of the site. Next only
 * counts it as a page when NEXT_PUBLIC_SPECIMENS is set, because that is
 * when next.config.ts puts `harness.tsx` in pageExtensions; with the flag
 * off the file is not a page, so it is never compiled into the build. The
 * getStaticProps guard below is the second line of defence, for a build that
 * enables the harness and is then deployed by accident.
 *
 * To add a section: create pagesComponents/specimens/<lane>.tsx exporting a
 * Specimen, then add it to SECTIONS below. That is the only shared line.
 */
const SECTIONS: Specimen[] = [
  foundation,
  tokens,
  atoms,
  buttons,
  glyphs,
  chrome,
  scene,
  composed,
];

const Specimens = () => (
  <main className="clif-specimens">
    <h1>specimens</h1>
    <nav>
      <ul>
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>{section.title}</a>
            {section.note === undefined ? null : (
              <p>{section.note}</p>
            )}
          </li>
        ))}
      </ul>
    </nav>
    {SECTIONS.map((section) => (
      <section id={section.id} key={section.id}>
        <h2>{section.title}</h2>
        {section.render()}
      </section>
    ))}
  </main>
);

export default Specimens;

export const getStaticProps: GetStaticProps = async () => {
  if (process.env.NEXT_PUBLIC_SPECIMENS !== '1') {
    return { notFound: true };
  }
  return { props: {} };
};
