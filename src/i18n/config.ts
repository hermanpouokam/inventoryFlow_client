export const fallbackLng = 'fr';
export const defaultNS = 'translation';

export const getOptions = (lng = fallbackLng, ns = defaultNS) => ({
  debug: false,
  supportedLngs: ['fr', 'en'],
  fallbackLng,
  lng,
  fallbackNS: defaultNS,
  defaultNS,
  ns,
});
