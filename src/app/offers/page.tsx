"use client";

import { signIn, useSession } from "next-auth/react";
import { useOffersPage } from "./useOffersPage.hooks";

export default function OffersPage() {
  const {} = useOffersPage();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div>
        <p>You need to sign in to access this page.</p>
        <button onClick={() => signIn()}>Sign In</button>
      </div>
    );
  }
  return <div>OffersPage</div>;
}
