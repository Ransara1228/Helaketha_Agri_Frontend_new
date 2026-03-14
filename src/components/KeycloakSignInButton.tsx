'use client';

import { signIn } from 'next-auth/react';

type KeycloakSignInButtonProps = {
  className?: string;
  label?: string;
  callbackUrl?: string;
};

export default function KeycloakSignInButton({
  className,
  label = 'Sign In / Register',
  callbackUrl = '/login',
}: KeycloakSignInButtonProps) {
  return (
    <button
      type="button"
      onClick={() =>
        signIn('keycloak', {
          callbackUrl,
          redirect: true,
          authorizationParams: { prompt: 'login' },
        })
      }
      className={className}
    >
      {label}
    </button>
  );
}
