import { describe, it, expect } from 'vitest';
import { STUDIO_CONTACT, studioContact, telHref } from './studio-contact';
import { getSiteSetting, type SiteSetting } from './contract';

const EMPTY: SiteSetting = {
  phone_primary: '',
  phone_secondary: '',
  email: '',
  instagram: '',
  address: '',
  og_image: { url: null, alt: null },
};

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

  it('falls back to the transcribed details while the CMS has none', () => {
    expect(studioContact(EMPTY)).toBe(STUDIO_CONTACT);
    expect(studioContact(undefined)).toBe(STUDIO_CONTACT);
  });

  it('uses the CMS details, whole, once an editor fills them in', () => {
    expect(
      studioContact({ ...EMPTY, phone_primary: '+62 811 0000 0000', email: 'hi@studio.example' })
    ).toEqual({ phones: ['+62 811 0000 0000'], email: 'hi@studio.example' });
    expect(studioContact({ ...EMPTY, email: 'hi@studio.example' })).toEqual({
      phones: [],
      email: 'hi@studio.example',
    });
  });
});
