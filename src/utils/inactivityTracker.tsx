// utils/inactivityTracker.js
let inactivityTimeout: string | number | NodeJS.Timeout | undefined;

export const startInactivityTracking = (onTimeout: () => void, timeoutDuration = 15 * 60 * 1000) => {
  const resetTimeout = () => {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(onTimeout, timeoutDuration);
  };

  document.addEventListener('mousemove', resetTimeout);
  document.addEventListener('keypress', resetTimeout);
  document.addEventListener('click', resetTimeout);
  document.addEventListener('scroll', resetTimeout);

  resetTimeout(); // Start tracking immediately
};

export const stopInactivityTracking = () => {
  clearTimeout(inactivityTimeout);
  document.removeEventListener('mousemove', x   );
  document.removeEventListener('keypress', setTimeout);
  document.removeEventListener('click', setTimeout);
  document.removeEventListener('scroll', setTimeout);
};
