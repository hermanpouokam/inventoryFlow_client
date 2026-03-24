// 'use client';

// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';
// import HttpBackend from 'i18next-http-backend';
// import LanguageDetector from 'i18next-browser-languagedetector';
// import { getOptions } from './config';

// i18n
//     .use(HttpBackend)
//     .use(LanguageDetector)
//     .use(initReactI18next)
//     .init({
//         ...getOptions(),
//         backend: {
//             loadPath: '/locales/{{lng}}/{{ns}}.json',
//         },
//         detection: {
//             order: ['cookie', 'navigator'],
//             caches: ['cookie'],
//         },
//     });

// export default i18n;
'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getOptions } from './config';
import wordsFr from './../../public/locales/fr/words.json';
import commonFr from './../../public/locales/fr/common.json';
import commonEn from './../../public/locales/en/common.json';
import permissionsFr from './../../public/locales/fr/permissions.json';
import permissionsEn from './../../public/locales/en/permissions.json';

const resources = {
    fr: {
        common: commonFr,
        permissions: permissionsFr,
        words: wordsFr
    },
    en: {
        common: commonEn,
        permissions: permissionsEn
    },
};

export const initClientI18n = async (lng: string) => {
    if (!i18n.isInitialized) {
        await i18n
            .use(initReactI18next)
            .init({
                ...getOptions(lng),
                resources,
                lng,
                react: { useSuspense: false },
            });
    }
    return i18n;
};
