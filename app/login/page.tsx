import { LoginClient } from "@/components/login-client";

type LoginPageProps = {
  searchParams?: {
    next?: string;
    error?: string;
  };
};

function getSafeNextPath(value: string | undefined, fallback = "/planner") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const nextPath = getSafeNextPath(searchParams?.next);
  return <LoginClient nextPath={nextPath} authError={searchParams?.error} />;
}
