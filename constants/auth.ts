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

export const AUTH_VERIFY_EMAIL = {
  title: 'Verify your email',
  subtitle: 'Enter the 6-digit code we sent to',
  codeLabel: 'Verification code',
  codePlaceholder: '000000',
  verify: 'Verify',
  resendPrompt: "Didn't receive the code?",
  resend: 'Resend',
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
  otpInvalid: 'That code is invalid or has expired. Request a new code and try again.',
  otpRequired: 'Enter the 6-digit code from your email.',
  resendFailed: 'Could not resend the code. Please try again.',
  network: 'Could not connect. Check your internet connection and try again.',
  generic: 'Something went wrong. Please try again.',
  signOutFailed: 'Could not sign out. Please try again.',
} as const;

export const AUTH_INFO = {
  confirmEmail: 'Check your email to confirm your account before logging in.',
} as const;

export const AUTH_SOCIAL_UNAVAILABLE = {
  title: 'Coming soon',
  message: 'Google and Apple sign-in will be available in a future update.',
} as const;
