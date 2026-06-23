
'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getOptions } from './config';
import wordsFr from './../../public/locales/fr/words.json';
import wordsEn from './../../public/locales/en/words.json';
import commonFr from './../../public/locales/fr/common.json';
import commonEn from './../../public/locales/en/common.json';
import permissionsFr from './../../public/locales/fr/permissions.json';
import permissionsEn from './../../public/locales/en/permissions.json';
import errorsFr from './../../public/locales/fr/errors.json';
import errorsEn from './../../public/locales/en/errors.json';
import greetingsFr from './../../public/locales/fr/greetings.json';
import greetingsEn from './../../public/locales/en/greetings.json';
import authFr from './../../public/locales/fr/auth.json';
import authEn from './../../public/locales/en/auth.json';
import legalEn from './../../public/locales/en/legal.json';
import legalFr from './../../public/locales/fr/legal.json';

const resources = {
    fr: {
        common: commonFr,
        permissions: permissionsFr,
        words: wordsFr,
        error: errorsFr,
        greetings: greetingsFr,
        auth: authFr,
        legal: legalFr,
    },
    en: {
        common: commonEn,
        permissions: permissionsEn,
        error: errorsEn,
        greetings: greetingsEn,
        words: wordsEn,
        auth: authEn,
        legal: legalEn,
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
