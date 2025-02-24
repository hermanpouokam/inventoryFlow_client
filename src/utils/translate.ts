import axios from 'axios';

interface TranslateResponse {
  translatedText: string;
}

export const translateText = async (
  text: string,
  targetLang: string,
  sourceLang: string = 'en'
): Promise<string | null> => {
  try {
    const response = await axios.post<TranslateResponse>(
      'https://libretranslate.de/translate',
      {
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return null;
  }
};
