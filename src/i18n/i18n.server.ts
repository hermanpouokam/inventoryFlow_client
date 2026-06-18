import i18next from 'i18next';
import { getOptions } from './config';
import Backend from 'i18next-fs-backend';
import path from 'path';

export async function initI18nServer(lng: string, ns?: string | string[]) {
    if (!i18next.isInitialized) {
        await i18next.use(Backend).init({
            ...getOptions(lng, ns),
            backend: {
                loadPath: path.resolve('./public/locales/{{lng}}/{{ns}}.json'),
            },
        });
    }
    return i18next;
}
