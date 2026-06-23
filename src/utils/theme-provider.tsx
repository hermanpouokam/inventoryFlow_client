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
  previewMode: (mode: ResolvedMode | null) => void;
}>({
  userMode: 'system',
  resolvedMode: 'light',
  changeMode: () => { },
  previewMode: () => { },
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

  const [override, setOverride] = useState<ResolvedMode | null>(null);

  const effectiveMode = override ?? resolvedMode;

  useEffect(() => {
    if (userMode === 'system') {
      setResolvedMode(getSystemMode());
    } else {
      setResolvedMode(userMode);
    }
  }, [userMode]);

  useEffect(() => {
    if (userMode !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      setResolvedMode(media.matches ? 'dark' : 'light');
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [userMode]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      effectiveMode === 'dark'
    );
  }, [effectiveMode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: effectiveMode,

          primary: {
            main: `hsl(var(--primary))`,
          },

          secondary: {
            main: `hsl(var(--secondary))`,
          },

          background: {
            default: `hsl(var(--background))`,
            paper:
              effectiveMode === "dark"
                ? `hsl(var(--background))`
                : `hsl(var(--card))`,
          },

          text: {
            primary: `hsl(var(--foreground))`,
            secondary: `hsl(var(--muted-foreground))`,
          },

          divider: `hsl(var(--border))`,
        },

        components: {
          MuiDialog: {
            defaultProps: {
              slotProps: {
                backdrop: {
                  sx: {
                    backdropFilter: "blur(5px)",
                    WebkitBackdropFilter: "blur(5px)",
                    backgroundColor:
                      effectiveMode === "dark"
                        ? "rgba(0,0,0,0.4)"
                        : "rgba(0,0,0,0.3)",
                  },
                },
              },
            },
            styleOverrides: {
              paper: {
                backgroundColor:
                  effectiveMode === "dark"
                    ? "#212121"
                    : "hsl(var(--card))",
                backgroundImage: "none",
              },
            },
          },

          MuiMenu: {
            styleOverrides: {
              paper: {
                backgroundColor:
                  effectiveMode === "dark"
                    ? "#212121"
                    : "hsl(var(--card))",
                backgroundImage: "none",
              },
            },
          },

          MuiPopover: {
            styleOverrides: {
              paper: {
                backgroundColor:
                  effectiveMode === "dark"
                    ? "#212121"
                    : "hsl(var(--card))",
                backgroundImage: "none",
              },
            },
          },

          MuiButton: {
            defaultProps: {
              color: "primary",
            },
          },

          MuiIconButton: {
            defaultProps: {
              color: "primary",
            },
          },

          MuiCheckbox: {
            defaultProps: {
              color: "primary",
            },
          },

          MuiRadio: {
            defaultProps: {
              color: "primary",
            },
          },

          MuiSwitch: {
            defaultProps: {
              color: "primary",
            },
          },

          MuiTextField: {
            defaultProps: {
              color: "primary",
            },
          },

          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "hsl(var(--primary))",
                },
              },
            },
          },

          MuiAutocomplete: {
            styleOverrides: {
              paper: {
                backgroundColor:
                  effectiveMode === "dark"
                    ? "#212121"
                    : "hsl(var(--card))",
              },
              option: {
                "&.Mui-focused": {
                  backgroundColor: "hsl(var(--secondary) / 0.15)",
                },
                "&.Mui-selected": {
                  backgroundColor: "hsl(var(--primary) / 0.15)",
                },
              },
            },
          },

          MuiMenuItem: {
            styleOverrides: {
              root: {
                "&.Mui-selected": {
                  backgroundColor: "hsl(var(--primary) / 0.15)",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "hsl(var(--primary) / 0.25)",
                },
              },
            },
          },
        },
      }),
    [effectiveMode]
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

  const previewMode = (mode: ResolvedMode | null) => {
    setOverride(mode);
  };

  return (
    <ThemeContext.Provider
      value={{
        userMode,
        resolvedMode: effectiveMode,
        changeMode,
        previewMode,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}