'use client';

import { ReactNode, useEffect, useState } from 'react';
import { initClientI18n } from '@/i18n/i18n.client';

type Props = {
  locale: string;
  children: ReactNode;
};

export default function I18nProvider({ locale, children }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initClientI18n(locale).then(() => setReady(true));
  }, [locale]);

  if (!ready) return null;

  return <>{children}</>;
}
