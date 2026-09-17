import type { GetStaticProps } from 'next';
import foundation from 'pagesComponents/specimens/foundation';
import type { Specimen } from 'pagesComponents/specimens/types';

/*
 * The design harness. It is not part of the site: getStaticProps 404s unless
 * NEXT_PUBLIC_SPECIMENS is '1', which only `pnpm specimens` sets, so the
 * route never exists in a production build.
 *
 * To add a section: create pagesComponents/specimens/<lane>.tsx exporting a
 * Specimen, then add it to SECTIONS below. That is the only shared line.
 */
const SECTIONS: Specimen[] = [foundation];

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
