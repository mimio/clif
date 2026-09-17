import { useState } from 'react';
import Pill from 'components/primitives/Pill';
import Text from 'components/primitives/Text';
import { EMAIL, MAILTO } from 'content/contact';
import { cn } from 'utils/cn';

/*
 * The mouth. Closed it is a 3px lip-line with no teeth showing; open, the
 * aperture drops to 6px from the top and grows to 12px, and two rows of teeth
 * appear. Same 180ms cubic-bezier(.165,.84,.44,1) as the eye, same
 * --eye-shadow, so the pair reads as one face.
 *
 * The panel is 262px with a bottom-right tail and holds two actions: a mailto
 * pill and a copy button whose label reads `copied` for 1600ms after a copy.
 */
export const COPIED_MS = 1600;

export type ContactMouthProps = {
  email?: string;
  defaultOpen?: boolean;
  className?: string;
};

export const ContactMouth = ({
  email = EMAIL,
  defaultOpen = false,
  className,
}: ContactMouthProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn('clif-contact-mouth', className)}>
      <button
        aria-expanded={open}
        aria-label="Contact"
        className="clif-contact-mouth-lips"
        data-open={open}
        onClick={() => setOpen(!open)}
        type="button"
      />
      {open ? (
        <div className="clif-contact-mouth-panel">
          <Text variant="label">say hello</Text>
          <Pill href={MAILTO} tone="accent">
            {email}
          </Pill>
        </div>
      ) : null}
    </div>
  );
};

export default ContactMouth;
