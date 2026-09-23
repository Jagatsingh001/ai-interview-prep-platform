'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="hover:text-studio-danger transition"
    >
      Log out
    </button>
  );
}
