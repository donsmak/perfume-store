import { randomBytes } from 'crypto';

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const generateGuestId = (): string => {
  return `guest_${randomBytes(8).toString('hex')}`;
};
