import { getProviders } from "next-auth/react";
import SigninContent from "@/components/auth/SigninContent";

export default async function SignInPage() {
  const providers = await getProviders();

  if (!providers) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span>No providers provided.</span>
      </div>
    );
  }

  return <SigninContent providers={providers} />;
}
