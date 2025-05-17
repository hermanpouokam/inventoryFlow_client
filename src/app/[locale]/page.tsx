import { initI18nServer } from '@/i18n/i18n.server';
import { fallbackLng, defaultNS } from '@/i18n/config';

type Props = {
    params: { locale: string };
};

export async function generateStaticParams() {
    return [{ locale: 'fr' }, { locale: 'en' }];
}

export default async function Page({ params }: Props) {
    const i18n = await initI18nServer(params.locale);
    const t = i18n.getFixedT(params.locale, defaultNS);

    return (
        <div>
            <h1>{t('hello')}</h1>
            <h1>{t('welcome')}</h1>
        </div>
    );
}
