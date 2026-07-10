const EMAIL_KEY = 'inku-remembered-email';
const PASSWORD_KEY = 'inku-remembered-password';

export const loadRememberedEmail = (): string => {
  return localStorage.getItem(EMAIL_KEY) ?? '';
};

export const loadRememberedPassword = (): string => {
  return localStorage.getItem(PASSWORD_KEY) ?? '';
};

export const persistRememberedCredentials = (email: string, password: string | undefined, remember: boolean): void => {
  if (remember && email) {
    localStorage.setItem(EMAIL_KEY, email);
    if (password) {
      localStorage.setItem(PASSWORD_KEY, password);
    }
  } else {
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(PASSWORD_KEY);
  }
};
