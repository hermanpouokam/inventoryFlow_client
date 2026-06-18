export const fallbackLng = 'fr';
export const languages = ['fr', 'en'] as const;
export const defaultNS = 'translation';

export const getOptions = (lng = fallbackLng, ns = defaultNS) => ({
  debug: false,
  supportedLngs: languages,
  fallbackLng,
  lng,
  fallbackNS: defaultNS,
  defaultNS,
  ns,
});
