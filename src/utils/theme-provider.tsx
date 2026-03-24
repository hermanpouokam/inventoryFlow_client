// 'use client';

// import {
//   createTheme,
//   ThemeProvider,
//   CssBaseline,
// } from '@mui/material';
// import { useEffect, useMemo, useState } from 'react';

// type Mode = 'light' | 'dark';

// export default function ThemeProviderClient({
//   children,
//   initialMode,
// }: {
//   children: React.ReactNode;
//   initialMode?: string;
// }) {
//   const getSystemTheme = (): Mode =>
//     window.matchMedia('(prefers-color-scheme: dark)').matches
//       ? 'dark'
//       : 'light';

//   const [mode, setMode] = useState<Mode>(
//     (initialMode as Mode) || getSystemTheme()
//   );

//   // sync Tailwind
//   useEffect(() => {
//     document.documentElement.classList.toggle('dark', mode === 'dark');
//   }, [mode]);

//   // listen system changes
//   useEffect(() => {
//     if (initialMode) return; // si user a choisi, ignore système

//     const media = window.matchMedia('(prefers-color-scheme: dark)');
//     const listener = () => {
//       setMode(media.matches ? 'dark' : 'light');
//     };

//     media.addEventListener('change', listener);
//     return () => media.removeEventListener('change', listener);
//   }, [initialMode]);

//   const theme = useMemo(
//     () =>
//       createTheme({
//         palette: {
//           mode,
//         },
//       }),
//     [mode]
//   );

//   const changeTheme = async (newMode: Mode) => {
//     setMode(newMode);
//     localStorage.setItem('theme', newMode);

//     await fetch('/api/theme', {
//       method: 'POST',
//       body: JSON.stringify({ theme: newMode }),
//     });
//   };

//   return (
//     <ThemeContext.Provider value={{ mode, changeTheme }}>
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
//         {children}
//       </ThemeProvider>
//     </ThemeContext.Provider>
//   );
// }

// import { createContext, useContext } from 'react';

// const ThemeContext = createContext<{
//   mode: Mode;
//   changeTheme: (mode: Mode) => void;
// }>({
//   mode: 'light',
//   changeTheme: () => {},
// });

// export const useThemeMode = () => useContext(ThemeContext);

'use client';

import {
  createTheme,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type UserMode = 'light' | 'dark' | 'system';
type ResolvedMode = 'light' | 'dark';

const ThemeContext = createContext<{
  userMode: UserMode;
  resolvedMode: ResolvedMode;
  changeMode: (mode: UserMode) => void;
}>({
  userMode: 'system',
  resolvedMode: 'light',
  changeMode: () => { },
});

export const useThemeMode = () => useContext(ThemeContext);

export default function ThemeProviderClient({
  children,
  initialMode,
}: {
  children: React.ReactNode;
  initialMode: string;
}) {
  const getSystemMode = (): ResolvedMode =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

  const [userMode, setUserMode] = useState<UserMode>(
    (initialMode as UserMode) || 'system'
  );

  const [resolvedMode, setResolvedMode] =
    useState<ResolvedMode>('light');

  // Resolve mode
  useEffect(() => {
    if (userMode === 'system') {
      setResolvedMode(getSystemMode());
    } else {
      setResolvedMode(userMode);
    }
  }, [userMode]);

  // Listen system change ONLY if system mode
  useEffect(() => {
    if (userMode !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      setResolvedMode(media.matches ? 'dark' : 'light');
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [userMode]);

  // Sync Tailwind
  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      resolvedMode === 'dark'
    );
  }, [resolvedMode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: resolvedMode,
        },
      }),
    [resolvedMode]
  );

  const changeMode = async (mode: UserMode) => {
    setUserMode(mode);
    localStorage.setItem('theme', mode);

    await fetch('/api/theme', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ theme: mode }),
    });
  };

  return (
    <ThemeContext.Provider
      value={{ userMode, resolvedMode, changeMode }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}