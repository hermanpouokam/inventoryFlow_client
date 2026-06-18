import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface TranslateResponse {
  translatedText: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, targetLang, sourceLang = 'en' } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

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
        headers: { 'Content-Type': 'application/json' },
      }
    );

    res.status(200).json({ translatedText: response.data.translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Failed to translate text' });
  }
}
