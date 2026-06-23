const EMAIL_KEY = 'inku-remembered-email';

// Legacy keys from earlier remember-password experiments — clear on read.
const LEGACY_PASSWORD_KEYS = ['inku-remembered-password', 'inku-remember-password', 'inku-remember-mode'] as const;

const clearLegacyRememberKeys = (): void => {
  for (const key of LEGACY_PASSWORD_KEYS) {
    localStorage.removeItem(key);
  }
};

export const loadRememberedEmail = (): string => {
  clearLegacyRememberKeys();
  return localStorage.getItem(EMAIL_KEY) ?? '';
};

export const persistRememberedEmail = (email: string, remember: boolean): void => {
  clearLegacyRememberKeys();
  if (remember && email) {
    localStorage.setItem(EMAIL_KEY, email);
    return;
  }
  localStorage.removeItem(EMAIL_KEY);
};
