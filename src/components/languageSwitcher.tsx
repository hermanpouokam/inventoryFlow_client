'use client';
import Cookies from 'js-cookie';

export const switchLang = (lng: string) => {
  Cookies.set('i18next', lng);
  window.location.reload();
};
