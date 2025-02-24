let inactivityTimeout: string | number | NodeJS.Timeout | undefined;

export const setInactivityTimeout = (onTimeout: () => void) => {
  clearTimeout(inactivityTimeout);
  inactivityTimeout = setTimeout(onTimeout, 15 * 60 * 1000); // 15 minutes timeout
};

export const resetInactivityTimeout = () => {
  clearTimeout(inactivityTimeout);
};

export const startTracking = (onTimeout: any) => {
  document.addEventListener('mousemove', () => resetInactivityTimeout());
  document.addEventListener('keypress', () => resetInactivityTimeout());
  setInactivityTimeout(onTimeout);
};