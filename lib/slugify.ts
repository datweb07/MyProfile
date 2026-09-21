import slugifyPackage from 'slugify';

export function createSlug(value: string) {
  return slugifyPackage(value, {
    lower: true,
    strict: true,
    locale: 'vi',
    trim: true
  });
}
