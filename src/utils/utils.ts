function capitalizeFirstLetter(word: string | null) {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1);
}
function capitalizeWords(sentence: string | null) {
    return sentence
        ?.split(' ')
        .map(word => capitalizeFirstLetter(word))
        .join(' ');
}

function maskEmail(email: string) {
    if (!email.includes('@')) return email;

    const [local, domain] = email.split('@');

    let maskedLocal;
    if (local.length <= 4) {
        maskedLocal = local[0] + '*'.repeat(local.length - 1);
    } else {
        maskedLocal = local.slice(0, 4) + '*'.repeat(5);
    }

    return `${maskedLocal}@${domain}`;
}

function generateUUIDv4(length = 16): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const rand = Math.random() * 16 | 0;
        const value = char === 'x' ? rand : (rand & 0x3 | 0x8);
        return value.toString(length);
    });
}

import i18n from "i18next";

type FormatDateReturn = {
  fromNow: () => string;
  long: () => string;
  numeric: () => string;
  withTime: () => string;
};

export const formatDate = (dateInput: Date | string | number): FormatDateReturn => {
  const date = new Date(dateInput);
  const now = new Date();

  const locale: string = i18n.language || "fr";

  const fromNow = (): string => {
    const diff = (date.getTime() - now.getTime()) / 1000;

    if (Math.abs(diff) < 60) {
      return locale === "fr" ? "à l'instant" : "just now";
    }

    const divisions: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
      { amount: 60, name: "second" },
      { amount: 60, name: "minute" },
      { amount: 24, name: "hour" },
      { amount: 7, name: "day" },
      { amount: 4.34524, name: "week" },
      { amount: 12, name: "month" },
      { amount: Infinity, name: "year" },
    ];

    let duration = diff;

    for (let i = 0; i < divisions.length; i++) {
      if (Math.abs(duration) < divisions[i].amount) {
        const rtf = new Intl.RelativeTimeFormat(locale, {
          numeric: "auto",
        });

        return rtf.format(
          Math.round(duration),
          divisions[i].name
        );
      }
      duration /= divisions[i].amount;
    }

    return "";
  };

  const long = (): string => {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const numeric = (): string => {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const withTime = (): string => {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return {
    fromNow,
    long,
    numeric,
    withTime,
  };
};

export { capitalizeFirstLetter, capitalizeWords, maskEmail, generateUUIDv4 }