import { getProviders } from "next-auth/react";
import SignInClient from "@/components/signin/SignInClient";

export default async function SignInPage() {
  const providers = await getProviders();
  if (providers == null) return;

  return <SignInClient providers={providers} />;
}
