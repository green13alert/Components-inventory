export const AUTH_SIGN_UP = {
  title: 'Create your Solderi account',
  subtitle: 'Save your components, projects and progress.',
  emailLabel: 'Email',
  emailPlaceholder: 'Enter your email',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Create a password',
  confirmPasswordLabel: 'Confirm Password',
  confirmPasswordPlaceholder: 'Confirm your password',
  createAccount: 'Create Account',
  loginPrompt: 'Already have an account?',
  loginLink: 'Log in',
  orDivider: 'or',
  continueApple: 'Continue with Apple',
  continueGoogle: 'Continue with Google',
} as const;

export const AUTH_LOGIN = {
  title: 'Welcome back',
  subtitle: 'Log in to access your workshop.',
  emailLabel: 'Email',
  emailPlaceholder: 'Enter your email',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Enter your password',
  logIn: 'Log in',
  signUpPrompt: "Don't have an account?",
  signUpLink: 'Sign up',
} as const;

export const AUTH_CHECK_EMAIL = {
  title: 'Confirm your email',
  subtitle: 'Tap the confirmation link we sent to',
  waiting: 'Waiting for confirmation…',
  resendPrompt: "Didn't get the email?",
  resend: 'Resend link',
} as const;

export const AUTH_ERRORS = {
  emailRequired: 'Enter your email.',
  emailInvalid: 'Enter a valid email address.',
  passwordRequired: 'Enter your password.',
  passwordTooShort: 'Password must be at least 6 characters.',
  confirmRequired: 'Confirm your password.',
  passwordMismatch: 'Passwords do not match.',
  invalidCredentials: 'Incorrect email or password.',
  emailNotConfirmed: 'Confirm your email before logging in. Check your inbox for a confirmation link.',
  alreadyRegistered: 'An account with this email already exists. Try logging in.',
  resendFailed: 'Could not resend the confirmation email. Please try again.',
  confirmationExpired: 'This confirmation link has expired. Request a new email and try again.',
  confirmationUsed: 'This confirmation link has already been used. Log in if your email is already confirmed.',
  confirmationInvalid: 'This confirmation link is invalid. Request a new email and try again.',
  confirmationMissing: 'No confirmation details were found in this link. Open the latest confirmation email and try again.',
  network: 'Could not connect. Check your internet connection and try again.',
  generic: 'Something went wrong. Please try again.',
  signOutFailed: 'Could not sign out. Please try again.',
} as const;

export const AUTH_CALLBACK = {
  title: 'Confirming your email',
  subtitle: 'Finishing sign-in…',
  errorTitle: 'Could not confirm email',
  logIn: 'Log in',
} as const;

export const AUTH_INFO = {
  confirmEmail: 'Check your email and tap the confirmation link to finish creating your account.',
} as const;

export const AUTH_SOCIAL_UNAVAILABLE = {
  title: 'Coming soon',
  message: 'Google and Apple sign-in will be available in a future update.',
} as const;
