import AuthForm from "@/components/AuthForm";

type SignupPageProps = {
  searchParams: Promise<{ username?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  return <AuthForm mode="signup" initialUsername={params.username || ""} />;
}
