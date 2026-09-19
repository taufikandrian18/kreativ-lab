import { describe, it, expect } from 'vitest';
import { STUDIO_CONTACT, telHref } from './studio-contact';
import { getSiteSetting } from './contract';

describe('STUDIO_CONTACT', () => {
  it('carries the two numbers and the email transcribed from deck page 26', () => {
    expect(STUDIO_CONTACT.phones).toEqual(['+62 813 1131 9739', '+62 812 7230 0977']);
    expect(STUDIO_CONTACT.email).toBe('kreativestudiolab@gmail.com');
  });

  it('strips spaces for the tel: href and leaves the visible text alone', () => {
    expect(telHref('+62 813 1131 9739')).toBe('tel:+6281311319739');
  });

  it('exists only because the CMS singleton is empty — delete it once that is populated', () => {
    // A tripwire, and it is meant to fail one day: the moment someone populates
    // site_setting, this goes red and points at the file to delete. A comment would not.
    const settings = getSiteSetting();
    expect(Boolean(settings.phone_primary || settings.email)).toBe(false);
  });
});
